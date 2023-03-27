# Overview
This repository contains a full stack application for managing user logins through a kiosk. The 
application consists of the following resources running on an Azure cloud environment:
- Web App running NodeJS
- CosmosDB for NoSQL
- Azure KeyVault

## Infrastructure Overview
### Azure KeyVault
The Azure KeyVault is used to contain any database connection strings required by the application.
Additionally, it also contains the PFX certificate needed to communicate with UW's ID card
reader and person search API services. For additional information, please contact UW ID
as this is out of scope for this documentation.

### CosmosDB for NoSQL
A CosmosDB instance is used for keeping track of application data such as login events
or possible login options. It is not necessary that you use the specific `CosmosDB for NoSQL`
offering, the `CosmosDB for MongoDB` offering may work but it could potentially require 
alterations on the backend.

### Web App running NodeJS
A web app running NodeJS is needed to use this application. It is highly recommended to use
the latest long-term support version of NodeJS offered by Azure as this application does not
have any requirements to be ran on an older NodeJS runtime.