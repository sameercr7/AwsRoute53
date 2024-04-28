const AWS = require('aws-sdk');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const path = require('path');
const ExcelJS = require('exceljs');
// Multer configuration for handling file uploads
const upload = multer({ storage: multer.memoryStorage() }); // Store files in memory

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// AWS Configuration
AWS.config.update({
  region: 'us-east-1', // Adjust to your region
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const route53 = new AWS.Route53(); // Initialize AWS Route 53 client
const hostedZoneId = process.env.ROUTE53_HOSTED_ZONE_ID; // Your Hosted Zone ID from environment variables

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

app.use(cors());
app.use(bodyParser.json()); // Parse JSON request bodies

// Define Mongoose schema and model for DNS records
const dnsRecordSchema = new mongoose.Schema({
  domain: { type: String, required: true },
  type: { type: String, required: true },
  value: { type: String, required: true },
});

const DnsRecord = mongoose.model('DnsRecord', dnsRecordSchema);

// Function to create a DNS record in Route 53
async function createRoute53Record(domain, type, value) {
  const params = {
    HostedZoneId: hostedZoneId,
    ChangeBatch: {
      Changes: [
        {
          Action: 'CREATE',
          ResourceRecordSet: {
            Name: domain,
            Type: type,
            TTL: 300, // Time to live
            ResourceRecords: [{ Value: value }],
          },
        },
      ],
    },
  };

  return await route53.changeResourceRecordSets(params).promise(); // Creates the DNS record in Route 53
}

// Function to delete a DNS record in Route 53
async function deleteRoute53Record(domain, type, value) {
  const params = {
    HostedZoneId: hostedZoneId,
    ChangeBatch: {
      Changes: [
        {
          Action: 'DELETE',
          ResourceRecordSet: {
            Name: domain,
            Type: type,
            TTL: 300,
            ResourceRecords: [{ Value: value }],
          },
        },
      ],
    },
  };

  return await route53.changeResourceRecordSets(params).promise(); // Deletes the DNS record in Route 53
}

// Creat a new DNS record form excel/csv
app.post('/api/upload', upload.single('file'), async (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const tempFilePath = path.join(__dirname, 'uploads', file.originalname);

  // Write the file buffer to a temporary file
  fs.writeFile(tempFilePath, file.buffer, async (err) => {
    if (err) {
      console.error('Error writing file:', err);
      return res.status(500).json({ message: 'Error saving file' });
    }

    // Read the temporary Excel file and extract data
    const workbook = new ExcelJS.Workbook();
    try {
      await workbook.xlsx.readFile(tempFilePath);

      const worksheet = workbook.getWorksheet(1); // Assuming data is in the first sheet
      const records = [];

      worksheet.eachRow((row, rowNumber) => {
        // Skip header row
   
          const rowData = [];
          row.eachCell((cell) => {
            rowData.push(cell.value);
          });
          records.push(rowData);
    
      });

      console.log('Parsed Excel data:', records);

      // Iterate over the parsed records and save them to Route 53 and MongoDB
      const savedRecords = [];
      for (const recordData of records) {
        const [domain, type, value] = recordData;

        // Create the DNS record in Route 53
        await createRoute53Record(domain, type, value);

        // Save the DNS record in MongoDB
        const newRecord = new DnsRecord({
          domain,
          type,
          value,
        });

        await newRecord.save(); // Save in MongoDB
        savedRecords.push(newRecord);
      }

      // Remove the temporary file
      fs.unlinkSync(tempFilePath);

      res.json({ message: 'File uploaded and DNS records created successfully', records: savedRecords });
    } catch (error) {
      console.error('Error parsing Excel file:', error);
      res.status(500).json({ message: 'Error parsing Excel file' });
    }
  });
});


// Create a new DNS record (Route 53 + MongoDB)
app.post('/api/dns-records', async (req, res) => {
  try {
    const { domain, type, value } = req.body;

    // Create the DNS record in Route 53
    await createRoute53Record(domain, type, value);

    // Save the DNS record in MongoDB
    const newRecord = new DnsRecord({
      domain,
      type,
      value,
    });


    await newRecord.save(); // Save in MongoDB

    res.status(201).json(newRecord); // Return the created record
  } catch (err) {
    console.error('Error creating DNS record:', err);
    res.status(400).json({ message: 'Bad Request', error: err.message });
  }
});

// Update a DNS record (Route 53 + MongoDB)
app.put('/api/dns-records/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { domain, type, value } = req.body;

    const existingRecord = await DnsRecord.findById(id);

    if (!existingRecord) {
      return res.status(404).json({ message: 'Record not found' });
    }

    // Delete the old DNS record in Route 53 and create a new one with updated details
    await deleteRoute53Record(existingRecord.domain, existingRecord.type, existingRecord.value);
    await createRoute53Record(domain, type, value);

    // Update the record in MongoDB
    const updatedRecord = await DnsRecord.findByIdAndUpdate(
      id,
      {
        domain,
        type,
        value,
      },
      { new: true } // Return the updated document
    );

    res.json(updatedRecord); // Return the updated record
  } catch (err) {
    console.error('Error updating DNS record:', err);
    res.status(400).json({ message: 'Bad Request', error: err.message });
  }
});
app.get('/api/dns-records', async (req, res) => {
  try {
    const records = await DnsRecord.find(); // Fetch all records from MongoDB
    res.json(records); // Return as JSON
  } catch (err) {
    console.error('Error fetching DNS records:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Delete a DNS record (Route 53 + MongoDB)
app.delete('/api/dns-records/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the record by ID
    const existingRecord = await DnsRecord.findById(id);
console.log("existing record ",existingRecord);
    if (!existingRecord) {
      return res.status(404).json({ message: 'Record not found' });
    }
    
    // Delete the DNS record from Route 53
    await deleteRoute53Record(existingRecord.domain, existingRecord.type, existingRecord.value);

    // Delete the record from MongoDB
    await DnsRecord.deleteOne({ _id: id });

    res.sendStatus(204); // Successful deletion
  } catch (err) {
    console.error('Error deleting DNS record:', err);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});
  
// Fetch hosted domains from Route 53
app.get('/api/hosted-domains', async (req, res) => {
  try {
    const params = {
      MaxItems: '100'// Adjust as needed to fetch more or fewer domains
    };

    const data = await route53.listHostedZones(params).promise(); // Retrieve hosted zones from Route 53
    const hostedDomains = data.HostedZones.map(zone => zone.Name); // Extract domain names

    res.json(hostedDomains); // Return hosted domains as JSON
  } catch (err) {
    console.error('Error fetching hosted domains:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});





// Fetch hosted zones and their respective record names
app.get('/api/hosted-zones-with-records', async (req, res) => {
  try {
    const params = {
      MaxItems: '100' // Adjust as needed to fetch more or fewer zones
    };

    const data = await route53.listHostedZones(params).promise(); // Retrieve hosted zones from Route 53
    const hostedZonesWithRecords = {};

    // Extract domain names from hosted zones
    const hostedZones = data.HostedZones.map(zone => zone.Id.replace(/\/hostedzone\//, '')); // Extract hosted zone ID

    // Fetch records for each hosted zone
    for (const zoneId of hostedZones) {
      const zoneParams = {
        HostedZoneId: zoneId,
        MaxItems: '100', // Adjust as needed to fetch more or fewer records
      };

      const zoneData = await route53.listResourceRecordSets(zoneParams).promise(); // Retrieve record sets for the zone
      const records = zoneData.ResourceRecordSets.map(record => record.Name.replace(/\.$/, '')); // Remove trailing dot

      hostedZonesWithRecords[zoneId] = records;
    }

    res.json(hostedZonesWithRecords); // Return hosted zones with their respective records as JSON
  } catch (err) {
    console.error('Error fetching hosted zones with records:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});



// Start the Express server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
