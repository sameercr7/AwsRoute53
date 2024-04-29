Running the DNS Management Web Application Locally:
1. Clone the Repository:
2. Install Dependencies:
3. To Run Frontend
4.  npm install
    npm start
5-To Run Backend
   cd backend
   npm install
   npm start

Note:From this site  https://freedns.afraid.org/domain/ I created a sub Domain and entered in the AWSrout53 Hosted Zones And After that you can add DNS server in that

Create a new file named .env in the root directory of the project and provide this key and Value.
PORT=<port_number>
MONGODB_URI="<mongodb_connection_string>"
AUTH0_DOMAIN="<auth0_domain>"
AUTH0_AUDIENCE="<auth0_audience>"
AUTH0_CLIENT_SECRET="<auth0_client_secret>"
AWS_ACCESS_KEY_ID="<aws_access_key_id>"
AWS_SECRET_ACCESS_KEY="<aws_secret_access_key>"
ROUTE53_HOSTED_ZONE_ID="<route53_hosted_zone_id>"

DNS Management Web Application Documentation

Introduction: The DNS Management Web Application is a sophisticated tool designed to streamline the management of domains and DNS records in bulk, specifically tailored for AWS Route 53. With its intuitive user interface and powerful backend capabilities, it empowers users to efficiently handle DNS operations while ensuring scalability, flexibility, and security.
Frontend Technologies:
•	React.js: Leveraging React.js, a cutting-edge JavaScript library, the frontend of the application delivers dynamic and interactive components, providing users with a seamless browsing experience.
•	JavaScript: Utilizing JavaScript for client-side scripting enhances the functionality of the web application, enabling real-time updates and dynamic content rendering.
•	HTML: The use of HTML, the standard markup language, structures the content of web pages, ensuring accessibility and semantic clarity.
•	CSS: Employing CSS for styling the user interface ensures a visually appealing design and enhances user engagement.
Backend Technology:
•	Node.js: The backend of the application is powered by Node.js, a robust JavaScript runtime environment. Node.js facilitates server-side scripting, enabling efficient handling of API requests and business logic execution.
Key Features:
1.	Centralized Dashboard: The dashboard serves as the central hub for managing domains and DNS records, providing users with a unified interface for all DNS-related tasks.
2.	Add New DNS Record: Users can effortlessly add new DNS records, specifying domain names, record types, and corresponding values, thereby simplifying the process of DNS record creation.
3.	Edit/Delete Records: The application enables users to edit or delete existing DNS records seamlessly. Changes made are reflected in both MongoDB and AWS Route 53, ensuring data consistency across platforms.
4.	Bulk Record Upload: Supporting bulk upload functionality, users can upload multiple DNS records simultaneously. The application saves these records in both MongoDB and AWS Route 53, enhancing efficiency and productivity.
5.	Graphical Chart: A graphical representation of domains versus the number of records they have provides users with insightful visual data, facilitating better understanding and analysis of DNS distribution.
6.	Search Functionality: The inclusion of a search feature enables users to quickly retrieve specific record names, enhancing user experience and optimizing workflow efficiency.
7.	Authentication and Authorization: Authentication and authorization mechanisms are implemented using Auth0, with Google authentication integrated to ensure secure access control and user identity management.
API Endpoints:
•	GET /api/dns-records: Retrieves DNS records from MongoDB.
•	GET /api/hosted-zones-with-records: Fetches hosted zones with records from AWS Route 53.
•	GET /api/hosted-domains: Retrieves hosted domains from Route 53.
•	PUT /api/dns-records/{id}: Updates existing DNS records.
•	POST /api/dns-records: Creates new DNS records.
•	DELETE /api/dns-records/{id}: Deletes DNS records from both MongoDB and Route 53.
•	POST /api/upload: Handles bulk upload of DNS records.
API Endpoints (Example URLs):
•	GET dns-records: https://awsroute53.onrender.com/api/dns-records
•	GET hosted-zones-with-records: https://awsroute53.onrender.com/api/hosted-zones-with-records
•	GET hosted-domains: https://awsroute53.onrender.com/api/hosted-domains
•	PUT Update existing record: https://awsroute53.onrender.com/api/dns-records/{currentRecord._id}
•	POST Create new record: https://awsroute53.onrender.com/api/dns-records
•	DELETE Deleting DNS Record: https://awsroute53.onrender.com/api/dns-records/{id}
•	POST Bulk Update: https://awsroute53.onrender.com/api/upload



Bugs:
1-While selecting Type of the Dns Server Record if wrong value entered I did not provided  any message to select the correct record for the selected DNS record.
2-If You want to Upload the Bulk record then first column should be Domain,Type,Value.
3-Also when you add the records from the excel the at instant it do not show the record but just if you login again you will be able to see the DNS records in the Table.
4-If record exist then it will not give message that record exist already ,but the value not  be entered in the either MongoDb and Awsroute53.

