const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const request = require("request"); // HTTP requests for obtaining Auth0 tokens

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

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

// Get all DNS records
app.get('/api/dns-records', async (req, res) => {
  try {
    const records = await DnsRecord.find(); // Fetch all DNS records
    res.json(records);
  } catch (err) {
    console.error('Error fetching DNS records:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Create a new DNS record
app.post('/api/dns-records', async (req, res) => {
  try {
    const { domain, type, value } = req.body;

    const newRecord = new DnsRecord({
      domain,
      type,
      value,
    });

    await newRecord.save(); // Save the new DNS record

    res.status(201).json(newRecord); // Return 201 for successful creation
  } catch (err) {
    console.error('Error creating DNS record:', err);
    res.status(400).json({ message: 'Bad Request', error: err.message });
  }
});
app.put('/api/dns-records/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { domain, type,value } = req.body;

    const updatedRecord = await DnsRecord.findByIdAndUpdate(
      id,
      {
        domain,
        type,
        value,
      },
      { new: true } // Return the updated document
    );

    if (!updatedRecord) {
      return res.status(404).json({ message: 'Record not found' });
    }

    res.json(updatedRecord); // Return the updated record
  } catch (err) {
    console.error('Error updating DNS record:', err);
    res.status(400).json({ message: 'Bad Request', error: err.message });
  }
});

// Delete a DNS record
app.delete('/api/dns-records/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedRecord = await DnsRecord.findByIdAndDelete(id);

    if (!deletedRecord) {
      return res.status(404).json({ message: 'Record not found' });
    }

    res.sendStatus(204); // Successful deletion
  } catch (err) {
    console.error('Error deleting DNS record:', err);
    res.status(400).json({ message: 'Bad Request', error: err.message });
  }
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
