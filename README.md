# Composable Microservices

Using module federation (a la Zack Jackson) and clean architecture (a la Uncle Bob), composable microservices combine the independence and agility of microservices with the integration and deployment simplicity of monoliths. This simple API framework supports CRUD operations for a domain model imported from a remote server with only a very basic contract. Following hexagonal architecture, the framework can be configured to generate ports and dynamically wire them to local or federated adapters. Similarly, adapters can be can wired to local or remote services at runtime. Ports can be piped together to form control flows with compensating flows that are generated automatically. 

The sample code in [federated-monolith-services](https://github.com/tysonrm/federated-monolith-services) shows a domain object with ports that are bound to adapters dynamically at runtime, and which are configured to participate in a control flow that implements the saga orchestrator pattern.
