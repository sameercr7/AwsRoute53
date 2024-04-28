import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Chart from "chart.js/auto"; // Import Chart.js
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Modal,
  Box,
  TextField,
  Typography,
  Select,
  MenuItem,
  Container,
} from "@mui/material";

import { useAuth0 } from "@auth0/auth0-react";
import "./dashboard.css"; // Importing the CSS

const recordTypes = [
  "SOA",
  "A",
  "TXT",
  "NS",
  "CNAME",
  "MX",
  "NAPTR",
  "PTR",
  "SRV",
  "SPF",
  "AAAA",
  "CAA",
  "DS",
];

const Dashboard = () => {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [dnsRecords, setDnsRecords] = useState([]);
  const [hostedZones, setHostedZones] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chartData, setChartData] = useState(null); // State for chart data
  const [chartReponseData, setChartResponseData] = useState([]);
  const [selectedZone, setSelectedZone] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [currentRecord, setCurrentRecord] = useState({
    domain: "",
    type: "",
    value: "",
  });

  useEffect(() => {
    if (isAuthenticated) {
      (async () => {
        const accessToken = await getAccessTokenSilently();

        // Fetch DNS records
        const dnsResponse = await axios.get(
          "https://awsroute53.onrender.com/api/dns-records",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        setDnsRecords(dnsResponse.data);

        const hostedZoneChartResponse = await axios.get(
          "https://awsroute53.onrender.com/api/hosted-zones-with-records",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        setChartResponseData(hostedZoneChartResponse.data);
        // Format data for chart
        const formattedData = Object.keys(hostedZoneChartResponse.data).map(
          (zoneId) => ({
            zoneId,
            records: hostedZoneChartResponse.data[zoneId],
          })
        );
        setChartData(formattedData);

        // Fetch hosted zones
        const hostedZonesResponse = await axios.get(
          "https://awsroute53.onrender.com/api/hosted-domains",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        setHostedZones(hostedZonesResponse.data);
      })();
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  useEffect(() => {
    if (chartData) {
      // Render chart when chartData is available
      const existingChart = Chart.getChart("myChart");
      if (existingChart) {
        existingChart.destroy();
      }
      renderChart();
    }
  }, [chartData]);
  const renderChart = () => {
    const ctx = document.getElementById("myChart");
    console.log(chartData);
    const chartLabels = chartData.map((zone) => {
      const firstRecord = zone.records.length > 0 ? zone.records[0] : "";
      return firstRecord;
    });
    const chartDataValues = chartData.map((zone) => zone.records.length);

    new Chart(ctx, {
      type: "bar",
      data: {
        labels: chartLabels,
        datasets: [
          {
            label: "Number of Records",
            data: chartDataValues,
            backgroundColor: "rgba(54, 162, 235, 0.2)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  };
  const handleOpenModal = (record = null) => {
    setIsModalOpen(true);
    setCurrentRecord(record || { domain: "", type: "", value: "" });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentRecord({
      domain: "",
      type: "",
      value: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentRecord((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveRecord = async () => {
    const accessToken = await getAccessTokenSilently();

    if (currentRecord._id) {
      // Update existing record
      const response = await axios.put(
        `https://awsroute53.onrender.com/api/dns-records/${currentRecord._id}`,
        currentRecord,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setDnsRecords((prev) =>
        prev.map((record) =>
          record._id === currentRecord._id ? response.data : record
        )
      );
    } else {
      // Create new record
      const response = await axios.post(
        "https://awsroute53.onrender.com/api/dns-records",
        currentRecord,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setDnsRecords((prev) => [...prev, response.data]);
    }
    handleCloseModal();
    Swal.fire("Record Saved", "The record is saved successfully.", "success");
  };
// For Deleting Dns Record
  const handleDeleteRecord = async (id) => {
    console.log("this id is to be deleted", id);
    const accessToken = await getAccessTokenSilently();
    await axios.delete(`https://awsroute53.onrender.com/api/dns-records/${id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    setDnsRecords((prev) => prev.filter((record) => record._id !== id));
    Swal.fire(
      "Record Deleted",
      "Selected record is deleted successfully.",
      "success"
    );
  };
  // Function to handle search input change
  const handleSearchInputChange = (e) => {
    setSearchKeyword(e.target.value);
  };

  // Filtered DNS records based on the search keyword
  const filteredDnsRecords = dnsRecords.filter((record) =>
    record.domain.toLowerCase().includes(searchKeyword.toLowerCase())
  );
  // post APi for Bulk Update
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
      const accessToken = await getAccessTokenSilently();
      await axios.post("https://awsroute53.onrender.com/api/upload", formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // Display success message to the user
      Swal.fire("Upload Successful", "File uploaded successfully.", "success");
    } catch (error) {
      // Display error message to the user
      Swal.fire("Upload Failed", error.response.data.message, "error");
    }
  };
  return (
    <div className="dashboard">
      <Container>
        <Typography variant="h4" component="h1" className="title">
          DNS Records Dashboard
        </Typography>
       

        <Select
          value={selectedZone} // Set value to the selected zone
          onChange={(e) => setSelectedZone(e.target.value)} // Update selected zone
          displayEmpty
          fullWidth
        >
          <MenuItem value="" disabled>
            Availaible Hosted Zone To Add DNS Records
          </MenuItem>
          {hostedZones.map((zone, index) => (
            <MenuItem key={index} value={zone}>
              {zone}
            </MenuItem>
          ))}
        </Select>
        <TextField
          label="Search"
          value={searchKeyword}
          onChange={handleSearchInputChange}
          fullWidth
          variant="outlined"
          margin="normal"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenModal()}
          className="add-button animated infinite pulse"
          style={{ margin: '20px' }}
        >
          Add New DNS Record
        </Button>
        <label class="custom-file-upload animated infinite pulse">
          <input type="file" onChange={handleFileUpload} />
          <span>Choose file to upload Bulk Data</span>
        </label>

        <TableContainer component={Paper} className="table-container">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <b>Domain</b>
                </TableCell>
                <TableCell>
                  <b>Type</b>
                </TableCell>
                <TableCell>
                  <b>Value</b>
                </TableCell>
                <TableCell>
                  <b>Actions</b>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDnsRecords.map((record) => (
                <TableRow key={record._id}>
                  <TableCell>{record.domain}</TableCell>
                  <TableCell>{record.type}</TableCell>
                  <TableCell>{record.value}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      onClick={() => handleOpenModal(record)}
                      className="action-button"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => handleDeleteRecord(record._id)}
                      className="action-button"
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <h2>Chart Data Domain Vs Records</h2>
        <canvas id="myChart" width="400" height="400"></canvas>
        <Modal open={isModalOpen} onClose={handleCloseModal}>
          <Box className="modal-content">
            <Typography variant="h6" component="h2">
              {currentRecord._id ? "Edit DNS Record" : "New DNS Record"}
            </Typography>

            <TextField
              label="Domain"
              name="domain"
              value={currentRecord?.domain || ""}
              onChange={handleInputChange}
              fullWidth
            />

            <Select
              label="Type"
              name="type"
              value={currentRecord?.type || ""}
              onChange={handleInputChange}
              fullWidth
            >
              {recordTypes.map((type, idx) => (
                <MenuItem key={idx} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>

            <TextField
              label="Value"
              name="value"
              value={currentRecord?.value || ""}
              onChange={handleInputChange}
              fullWidth
            />

            <Button
              variant="contained"
              onClick={handleSaveRecord}
              sx={{ marginTop: 2 }}
            >
              Save
            </Button>

            <Button
              variant="contained"
              onClick={handleCloseModal}
              sx={{ marginTop: 2 }}
            >
              Cancel
            </Button>
          </Box>
        </Modal>
      </Container>
    </div>
  );
};

export default Dashboard;
