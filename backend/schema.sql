-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: pv_new_test
-- ------------------------------------------------------
-- Server version	9.5.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ 'd2d94ad1-c500-11f0-a9c1-4c72b921b21b:1-192';

--
-- Table structure for table `ac_users`
--

DROP TABLE IF EXISTS `ac_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ac_users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `username` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `status` enum('Active','Inactive') COLLATE utf8mb4_general_ci DEFAULT 'Active',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`),
  KEY `employee_id` (`employee_id`),
  CONSTRAINT `ac_users_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `emp_employee` (`employee_id`)
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ac_users`
--

LOCK TABLES `ac_users` WRITE;
/*!40000 ALTER TABLE `ac_users` DISABLE KEYS */;
INSERT INTO `ac_users` VALUES (1,1,'user1','$2b$12$.IhoIqodRfVta8Etzcf82eT7CKh3mrXqvT8Pu1OGkSstLQFXr3bHq','user1@example.com','Active','2025-04-11 15:04:23'),(2,2,'user2','$2b$12$.IhoIqodRfVta8Etzcf82eT7CKh3mrXqvT8Pu1OGkSstLQFXr3bHq','user2@example.com','Inactive','2025-04-11 15:04:23'),(3,3,'user3','$2b$12$.IhoIqodRfVta8Etzcf82eT7CKh3mrXqvT8Pu1OGkSstLQFXr3bHq','user3@example.com','Active','2025-04-11 15:04:23'),(4,4,'user4','$2b$12$.IhoIqodRfVta8Etzcf82eT7CKh3mrXqvT8Pu1OGkSstLQFXr3bHq','user4@example.com','Active','2025-04-11 15:04:23'),(5,5,'user5','hash123','user5@example.com','Inactive','2025-04-11 15:04:23'),(6,6,'user6','hash123','user6@example.com','Active','2025-04-11 15:04:23'),(7,7,'user7','hash123','user7@example.com','Active','2025-04-11 15:04:23'),(8,8,'user8','hash123','user8@example.com','Inactive','2025-04-11 15:04:23'),(9,9,'user9','hash123','user9@example.com','Active','2025-04-11 15:04:23'),(10,10,'user10','hash123','user10@example.com','Active','2025-04-11 15:04:23'),(11,11,'user11','hash123','user11@example.com','Inactive','2025-04-11 15:04:23'),(12,12,'user12','hash123','user12@example.com','Active','2025-04-11 15:04:23'),(13,13,'user13','hash123','user13@example.com','Active','2025-04-11 15:04:23'),(14,14,'user14','hash123','user14@example.com','Inactive','2025-04-11 15:04:23'),(15,15,'user15','hash123','user15@example.com','Active','2025-04-11 15:04:23'),(16,16,'user16','hash123','user16@example.com','Active','2025-04-11 15:04:23'),(17,17,'user17','hash123','user17@example.com','Inactive','2025-04-11 15:04:23'),(18,18,'user18','hash123','user18@example.com','Active','2025-04-11 15:04:23'),(19,19,'user19','hash123','user19@example.com','Active','2025-04-11 15:04:23'),(20,20,'user20','hash123','user20@example.com','Inactive','2025-04-11 15:04:23'),(21,21,'user21','hash123','user21@example.com','Active','2025-04-11 15:04:23'),(22,22,'user22','hash123','user22@example.com','Active','2025-04-11 15:04:23'),(23,23,'user23','hash123','user23@example.com','Inactive','2025-04-11 15:04:23'),(24,24,'user24','hash123','user24@example.com','Active','2025-04-11 15:04:23'),(25,25,'user25','hash123','user25@example.com','Active','2025-04-11 15:04:23'),(26,26,'user26','hash123','user26@example.com','Inactive','2025-04-11 15:04:23'),(27,27,'user27','hash123','user27@example.com','Active','2025-04-11 15:04:23'),(28,28,'user28','hash123','user28@example.com','Active','2025-04-11 15:04:23'),(29,29,'user29','hash123','user29@example.com','Inactive','2025-04-11 15:04:23'),(30,30,'user30','hash123','user30@example.com','Active','2025-04-11 15:04:23'),(31,31,'user31','hash123','user31@example.com','Active','2025-04-11 15:04:23'),(32,32,'user32','hash123','user32@example.com','Inactive','2025-04-11 15:04:23'),(33,33,'user33','hash123','user33@example.com','Active','2025-04-11 15:04:23'),(34,34,'user34','hash123','user34@example.com','Active','2025-04-11 15:04:23'),(35,35,'user35','hash123','user35@example.com','Inactive','2025-04-11 15:04:23'),(36,36,'user36','hash123','user36@example.com','Active','2025-04-11 15:04:23'),(37,37,'user37','hash123','user37@example.com','Active','2025-04-11 15:04:23'),(38,38,'user38','hash123','user38@example.com','Inactive','2025-04-11 15:04:23'),(39,39,'user39','hash123','user39@example.com','Active','2025-04-11 15:04:23'),(40,40,'user40','hash123','user40@example.com','Active','2025-04-11 15:04:23'),(41,41,'user41','hash123','user41@example.com','Inactive','2025-04-11 15:04:23'),(42,42,'user42','hash123','user42@example.com','Active','2025-04-11 15:04:23'),(43,43,'user43','hash123','user43@example.com','Active','2025-04-11 15:04:23'),(44,44,'user44','hash123','user44@example.com','Inactive','2025-04-11 15:04:23'),(45,45,'user45','hash123','user45@example.com','Active','2025-04-11 15:04:23'),(46,46,'user46','hash123','user46@example.com','Active','2025-04-11 15:04:23'),(47,47,'user47','hash123','user47@example.com','Inactive','2025-04-11 15:04:23'),(48,48,'user48','hash123','user48@example.com','Active','2025-04-11 15:04:23'),(49,49,'user49','hash123','user49@example.com','Active','2025-04-11 15:04:23'),(50,50,'user50','hash123','user50@example.com','Inactive','2025-04-11 15:04:23');
/*!40000 ALTER TABLE `ac_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `branches`
--

DROP TABLE IF EXISTS `branches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `branches` (
  `branch_id` int NOT NULL AUTO_INCREMENT,
  `company_id` int NOT NULL,
  `branch_name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `address` text COLLATE utf8mb4_general_ci,
  `city` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `state` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `country` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `phone_number` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`branch_id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `branches_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`company_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `branches`
--

LOCK TABLES `branches` WRITE;
/*!40000 ALTER TABLE `branches` DISABLE KEYS */;
INSERT INTO `branches` VALUES (1,1,'New York Branch','123 Madison Ave, Suite 100','New York','NY','USA','+1-212-555-0100','nybranch@example.com','2025-04-09 14:59:31'),(2,2,'London Office','221B Baker Street','London','England','UK','+44-20-7946-0958','london@example.co.uk','2025-04-09 14:59:31'),(3,3,'Mumbai Hub','405 Tech Park','Mumbai','Maharashtra','India','+91-22-4000-3000','mumbai@example.in','2025-04-09 14:59:31'),(4,4,'Sydney Division','Level 3, 456 George St','Sydney','NSW','Australia','+61-2-9374-4000','sydney@example.com.au','2025-04-09 14:59:31'),(5,5,'Dubai Regional','Office 205, Emirates Tower','Dubai','Dubai','UAE','+971-4-123-4567','dubai@example.ae','2025-04-09 14:59:31');
/*!40000 ALTER TABLE `branches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `companies`
--

DROP TABLE IF EXISTS `companies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `companies` (
  `company_id` int NOT NULL AUTO_INCREMENT,
  `company_name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `registration_no` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `industry_type` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `website_url` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `phone_prefix` varchar(10) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '-- e.g., +91, +1, +44',
  `phone_number` varchar(15) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '-- Only digits, Allow 7 to 15 digits, as recommended by ITU-T E.164 (the international phone number standard)',
  `phone_extension` varchar(10) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT ' -- Optional, like 1234',
  `address` text COLLATE utf8mb4_general_ci,
  `country` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `logo_path` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`company_id`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `companies`
--

LOCK TABLES `companies` WRITE;
/*!40000 ALTER TABLE `companies` DISABLE KEYS */;
INSERT INTO `companies` VALUES (1,'TechNova Solutions','TN12345','IT Services','https://technova.com','info@technova.com','+1','1234567890','101','123 Silicon Valley Blvd, CA','USA','logos/technova.png','2025-04-09 14:50:13'),(2,'GreenGrow AgriTech','GG98231','Agriculture','https://greengrow.ag','support@greengrow.ag','+91','9988776655',NULL,'45 Farm Street, Punjab','India','logos/greengrow.png','2025-04-09 14:50:13'),(3,'AquaPure Systems','AQ45678','Water Purification','https://aquapure.com','contact@aquapure.com','+44','7700112233','207','12 Riverbank Lane, London','UK',NULL,'2025-04-09 14:50:13'),(4,'MetroConstruct Ltd','MC33445','Construction','https://metroconstruct.co.uk','admin@metroconstruct.co.uk','+44','7894561230',NULL,'84 Builder Ave, Manchester','UK','logos/metroconstruct.png','2025-04-09 14:50:13'),(5,'HealthFirst Diagnostics','HF10982','Healthcare','https://healthfirst.com','hello@healthfirst.com','+1','2125550987','45','9 Wellness Street, NY','USA',NULL,'2025-04-09 14:50:13'),(6,'Cloudify Tech','CL23456','Cloud Computing','https://cloudify.tech','team@cloudify.tech','+61','612345678',NULL,'88 Sky Hub, Sydney','Australia','logos/cloudify.png','2025-04-09 14:50:13'),(7,'EcoDrive Motors','ED99887','Automotive','https://ecodrive.com','service@ecodrive.com','+49','1523456789',NULL,'100 Autobahn Rd, Berlin','Germany',NULL,'2025-04-09 14:50:13'),(8,'SolarX Energy','SX55661','Renewable Energy','https://solarx.energy','info@solarx.energy','+91','8877665544',NULL,'22 Solar Park, Gujarat','India','logos/solarx.png','2025-04-09 14:50:13'),(9,'BrightEdu Academy','BE19283','Education','https://brightedu.edu','contact@brightedu.edu','+1','3156781234',NULL,'7 Campus Drive, Boston','USA',NULL,'2025-04-09 14:50:13'),(10,'FinGlobe Inc','FG55679','Finance','https://finglobe.com','support@finglobe.com','+65','987654321',NULL,'88 Business Bay, Singapore','Singapore','logos/finglobe.png','2025-04-09 14:50:13'),(11,'PixelPerfect Designs','PP66778','Design','https://pixelperfect.design','studio@pixelperfect.design','+33','7654321098',NULL,'9 Art Street, Paris','France',NULL,'2025-04-09 14:50:13'),(12,'MedCore Pharma','MC78901','Pharmaceuticals','https://medcorepharma.com','sales@medcorepharma.com','+39','6543210987','99','76 Health Zone, Milan','Italy','logos/medcore.png','2025-04-09 14:50:13'),(13,'Zenith Aerospace','ZA12390','Aerospace','https://zenithaero.com','info@zenithaero.com','+81','9876543210',NULL,'Tokyo Science Park, Japan','Japan',NULL,'2025-04-09 14:50:13'),(14,'ByteCraft Inc','BC45622','Software Development','https://bytecraft.io','dev@bytecraft.io','+1','4567890123',NULL,'101 Tech Valley, Austin','USA','logos/bytecraft.png','2025-04-09 14:50:13'),(15,'DataHive Analytics','DH89012','Data Analytics','https://datahive.ai','contact@datahive.ai','+91','9988776622',NULL,'33 Data District, Hyderabad','India',NULL,'2025-04-09 14:50:13'),(16,'NextGen Robotics','NG56321','Robotics','https://nextgenrobotics.com','support@nextgenrobotics.com','+49','1609876543',NULL,'45 Innovation Hub, Munich','Germany','logos/nextgen.png','2025-04-09 14:50:13'),(17,'SafeBank Ltd','SB45672','Banking','https://safebank.com','care@safebank.com','+971','501234567','89','Dubai Business District','UAE',NULL,'2025-04-09 14:50:13'),(18,'PetroWorld Corp','PW23456','Oil & Gas','https://petroworld.com','office@petroworld.com','+966','553212345',NULL,'Oil Tower, Riyadh','Saudi Arabia',NULL,'2025-04-09 14:50:13'),(19,'QuickMart Retail','QM88761','Retail','https://quickmart.com','support@quickmart.com','+1','2129876543',NULL,'Main Street Mall, Chicago','USA','logos/quickmart.png','2025-04-09 14:50:13'),(20,'AgroSolutions Pvt Ltd','AS56789','Agro Solutions','https://agrosolutions.in','help@agrosolutions.in','+91','7890123456',NULL,'Farm Block B, Maharashtra','India',NULL,'2025-04-09 14:50:13'),(21,'OceanFleet Shipping','OF12387','Shipping','https://oceanfleet.com','info@oceanfleet.com','+44','7788991122',NULL,'Port Tower, Liverpool','UK','logos/oceanfleet.png','2025-04-09 14:50:13'),(22,'SkyNet Drones','SD99871','Drones','https://skynetdrones.io','team@skynetdrones.io','+1','2023456789',NULL,'9 AirTech Ave, Denver','USA',NULL,'2025-04-09 14:50:13'),(23,'NeuroLink Labs','NL76123','Biotech','https://neurolinklabs.com','research@neurolinklabs.com','+31','612345098','12','Innovation Street, Amsterdam','Netherlands','logos/neurolink.png','2025-04-09 14:50:13'),(24,'EduBridge International','EB12344','Education','https://edubridge.org','info@edubridge.org','+91','9876501234',NULL,'Bridge Lane, Kerala','India',NULL,'2025-04-09 14:50:13'),(25,'XenoGaming Studios','XG99888','Gaming','https://xenogaming.com','support@xenogaming.com','+61','423456789',NULL,'Level 5, Game Center, Melbourne','Australia','logos/xenogaming.png','2025-04-09 14:50:13'),(26,'AeroSpaceX','ASX45467','Aerospace','https://aerospacex.org','team@aerospacex.org','+86','13912345678',NULL,'Launch Base, Beijing','China',NULL,'2025-04-09 14:50:13'),(27,'BioHarvest Inc','BH55578','Biotech','https://bioharvest.com','contact@bioharvest.com','+1','4081234567',NULL,'Green Street, San Jose','USA',NULL,'2025-04-09 14:50:13'),(28,'SmartWare Solutions','SW99888','IT Solutions','https://smartware.io','info@smartware.io','+65','81234567',NULL,'Tech Tower, Singapore','Singapore','logos/smartware.png','2025-04-09 14:50:13'),(29,'FuelCore Energy','FC12098','Energy','https://fuelcore.energy','service@fuelcore.energy','+91','8765432190',NULL,'Power Plant Road, Tamil Nadu','India',NULL,'2025-04-09 14:50:13'),(30,'Mindful HealthTech','MH45231','HealthTech','https://mindfultech.health','info@mindfultech.health','+1','3012345678',NULL,'Medical Valley, California','USA',NULL,'2025-04-09 14:50:13'),(31,'InnoCraft Furnishings','IC44561','Furniture','https://innocraft.com','sales@innocraft.com','+49','1701122334',NULL,'Designer Lane, Hamburg','Germany','logos/innocraft.png','2025-04-09 14:50:13'),(32,'LogiCore Logistics','LC33467','Logistics','https://logicorelogistics.com','contact@logicorelogistics.com','+971','502233445',NULL,'Transport City, Abu Dhabi','UAE',NULL,'2025-04-09 14:50:13'),(33,'ZentoWear','ZW88900','E-Commerce','https://zentowear.com','help@zentowear.com','+1','4159988776',NULL,'Fashion Park, New York','USA','logos/zentowear.png','2025-04-09 14:50:13'),(34,'CyberArmor Security','CA11122','Cybersecurity','https://cyberarmor.com','support@cyberarmor.com','+91','7001122334','105','Infosec Tower, Bangalore','India',NULL,'2025-04-09 14:50:13'),(35,'PlantoGrow','PG22110','Agritech','https://plantogrow.ag','hello@plantogrow.ag','+27','712345678',NULL,'Greenway, Cape Town','South Africa',NULL,'2025-04-09 14:50:13'),(36,'CleanFuture Waste','CF66788','Waste Management','https://cleanfuture.org','info@cleanfuture.org','+61','323456789',NULL,'Eco Park, Sydney','Australia',NULL,'2025-04-09 14:50:13'),(37,'BuildPro Solutions','BP55661','Civil Engineering','https://buildpro.com','team@buildpro.com','+44','7700345612',NULL,'Construction Zone, Glasgow','UK','logos/buildpro.png','2025-04-09 14:50:13'),(38,'SmartFit Wearables','SF99823','Wearables','https://smartfit.io','support@smartfit.io','+1','6198765432',NULL,'Wellness Center, LA','USA',NULL,'2025-04-09 14:50:13'),(39,'NetZero Homes','NZ12321','Real Estate','https://netzero.homes','sales@netzero.homes','+49','1512123456',NULL,'Green Home Park, Berlin','Germany',NULL,'2025-04-09 14:50:13'),(40,'WaveNet Telecom','WT88910','Telecom','https://wavenet.tel','contact@wavenet.tel','+91','9900887766','401','Telecom Nagar, Pune','India','logos/wavenet.png','2025-04-09 14:50:13');
/*!40000 ALTER TABLE `companies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `department_roles`
--

DROP TABLE IF EXISTS `department_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `department_roles` (
  `dept_role_id` int NOT NULL AUTO_INCREMENT,
  `department_id` int NOT NULL,
  `employee_id` int NOT NULL,
  `role_level` int NOT NULL COMMENT 'role_level indicates the hierarchy or authority level of each role within a department',
  `assigned_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `note` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`dept_role_id`),
  KEY `department_id` (`department_id`),
  KEY `employee_id` (`employee_id`),
  KEY `role_level` (`role_level`),
  CONSTRAINT `department_roles_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`),
  CONSTRAINT `department_roles_ibfk_2` FOREIGN KEY (`employee_id`) REFERENCES `emp_employee` (`employee_id`),
  CONSTRAINT `department_roles_ibfk_3` FOREIGN KEY (`role_level`) REFERENCES `roles` (`role_level`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `department_roles`
--

LOCK TABLES `department_roles` WRITE;
/*!40000 ALTER TABLE `department_roles` DISABLE KEYS */;
INSERT INTO `department_roles` VALUES (1,1,1,1,'2025-04-10 15:12:40','Alice as Head in Operations'),(2,2,2,2,'2025-04-10 15:12:40','Bob as Manager in Finance'),(3,3,3,2,'2025-04-10 15:12:40','Charlie as Manager in IT'),(4,4,4,5,'2025-04-10 15:12:40','David as Member in HR'),(5,5,5,3,'2025-04-10 15:12:40','Eva as Supervisor in Manufacturing'),(6,1,6,4,'2025-04-10 15:12:40','Frank as Team Lead in Operations'),(7,2,7,5,'2025-04-10 15:12:40','Grace as Member in Finance'),(8,3,8,4,'2025-04-10 15:12:40','Henry as Team Lead in IT'),(9,4,9,6,'2025-04-10 15:12:40','Isla as Intern in HR'),(10,5,10,5,'2025-04-10 15:12:40','Jake as Member in Manufacturing'),(11,1,11,3,'2025-04-10 15:12:40','Karen as Supervisor in Operations'),(12,2,12,9,'2025-04-10 15:12:40','Liam as Analyst in Finance'),(13,3,13,7,'2025-04-10 15:12:40','Mona as Consultant in IT'),(14,4,14,10,'2025-04-10 15:12:40','Nina as Coordinator in HR'),(15,5,15,5,'2025-04-10 15:12:40','Oscar as Member in Manufacturing'),(16,1,16,5,'2025-04-10 15:12:40','Pam as Member in Operations'),(17,2,17,8,'2025-04-10 15:12:40','Quinn as Assistant in Finance'),(18,3,18,5,'2025-04-10 15:12:40','Ravi as Member in IT'),(19,4,19,5,'2025-04-10 15:12:40','Sara as Member in HR'),(20,5,20,5,'2025-04-10 15:12:40','Tom as Member in Manufacturing');
/*!40000 ALTER TABLE `department_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departments` (
  `department_id` int NOT NULL AUTO_INCREMENT,
  `company_id` int NOT NULL,
  `branch_id` int NOT NULL,
  `department_name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `short_code` varchar(10) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`department_id`),
  KEY `company_id` (`company_id`),
  KEY `branch_id` (`branch_id`),
  CONSTRAINT `departments_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`company_id`),
  CONSTRAINT `departments_ibfk_2` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`branch_id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departments`
--

LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
INSERT INTO `departments` VALUES (1,1,1,'Human Resources','HR','Handles employee recruitment, benefits, and relations.','2025-04-09 15:03:27'),(2,1,2,'Finance','FIN','Manages company finances and accounts.','2025-04-09 15:03:27'),(3,2,1,'Information Technology','IT','Oversees IT infrastructure and support.','2025-04-09 15:03:27'),(4,2,2,'Marketing','MKT','Develops and executes marketing strategies.','2025-04-09 15:03:27'),(5,3,3,'Sales','SAL','Responsible for revenue generation through sales.','2025-04-09 15:03:27'),(6,3,4,'Customer Support','CS','Provides support and solutions to customers.','2025-04-09 15:03:27'),(7,4,2,'Legal','LEG','Handles legal compliance and advice.','2025-04-09 15:03:27'),(8,4,3,'Research & Development','R&D','Innovates and develops new products.','2025-04-09 15:03:27'),(9,5,4,'Procurement','PRC','Manages purchasing and supplier relationships.','2025-04-09 15:03:27'),(10,5,5,'Logistics','LOG','Handles transportation and inventory.','2025-04-09 15:03:27'),(11,1,3,'Training','TRN','Organizes training programs for employees.','2025-04-09 15:03:27'),(12,2,4,'Admin','ADM','Manages administrative functions.','2025-04-09 15:03:27'),(13,3,5,'Security','SEC','Ensures safety and security of resources.','2025-04-09 15:03:27'),(14,4,1,'Engineering','ENG','Designs and develops products and infrastructure.','2025-04-09 15:03:27'),(15,5,1,'Operations','OPS','Oversees day-to-day business operations.','2025-04-09 15:03:27'),(16,1,2,'Data Analytics','DA','Analyzes data to support business decisions.','2025-04-09 15:03:27'),(17,2,5,'Product Management','PM','Manages product lifecycle and features.','2025-04-09 15:03:27'),(18,3,1,'UX Design','UX','Improves user experience across products.','2025-04-09 15:03:27'),(19,4,5,'Quality Assurance','QA','Ensures quality standards in deliverables.','2025-04-09 15:03:27'),(20,5,3,'Public Relations','PR','Manages company image and media relations.','2025-04-09 15:03:27');
/*!40000 ALTER TABLE `departments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `emp_employee`
--

DROP TABLE IF EXISTS `emp_employee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `emp_employee` (
  `employee_id` int NOT NULL AUTO_INCREMENT,
  `company_id` int NOT NULL,
  `branch_id` int NOT NULL,
  `department_id` int NOT NULL,
  `reports_to` int NOT NULL,
  `position_id` int NOT NULL,
  `first_name` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `last_name` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `gender` enum('Male','Female','Other') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `phone_number` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_general_ci,
  `job_title_id` int DEFAULT NULL,
  `hire_date` date DEFAULT NULL,
  `employment_type` enum('Full-time','Part-time','Contract','Intern') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `status` enum('Active','Inactive','Terminated') COLLATE utf8mb4_general_ci DEFAULT 'Active',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`employee_id`),
  KEY `company_id` (`company_id`),
  KEY `branch_id` (`branch_id`),
  KEY `department_id` (`department_id`),
  KEY `employees_ibfk_4` (`job_title_id`),
  KEY `fk_employee_reports_to` (`reports_to`),
  KEY `fk_employee_reports_to1` (`position_id`),
  CONSTRAINT `emp_employee_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`company_id`),
  CONSTRAINT `emp_employee_ibfk_2` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`branch_id`),
  CONSTRAINT `emp_employee_ibfk_3` FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`),
  CONSTRAINT `emp_employee_ibfk_4` FOREIGN KEY (`job_title_id`) REFERENCES `positions` (`position_id`),
  CONSTRAINT `fk_employee_position` FOREIGN KEY (`position_id`) REFERENCES `positions` (`position_id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_employee_reports_to1` FOREIGN KEY (`position_id`) REFERENCES `positions` (`position_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `emp_employee`
--

LOCK TABLES `emp_employee` WRITE;
/*!40000 ALTER TABLE `emp_employee` DISABLE KEYS */;
INSERT INTO `emp_employee` VALUES (1,3,5,1,3,18,'Tonya','Baker','Female','1993-12-04','briggsmatthew@lara.com','891-036-3636x096','087 Patrick Views Suite 516, Lake Lorichester, WA 79949',20,'2022-07-18','Part-time','Active','2025-04-10 14:56:59'),(2,1,2,3,3,18,'Amy','Cox','Female','1974-03-06','christopher10@caldwell-thompson.biz','+1-219-098-9387x5672','641 Adkins Alley, North Stacey, OH 61908',11,'2016-04-10','Intern','Active','2025-04-10 14:56:59'),(3,1,4,5,3,18,'Kenneth','Jordan','Male','1992-08-26','moorejessica@price.com','(771)145-4271x61390','688 Gomez Gateway, Conniefort, AZ 47343',17,'2020-04-10','Intern','Active','2025-04-10 14:56:59'),(4,3,3,5,3,18,'Kenneth','Ritter','Male','1971-11-07','andrewsjamie@yahoo.com','001-416-446-1496x759','75199 Serrano Cove, South Dawnchester, NY 13144',7,'2021-04-26','Contract','Terminated','2025-04-10 14:56:59'),(5,2,1,4,3,18,'Rebecca','Cantu','Female','1964-07-02','fsellers@hotmail.com','575.096.9871','366 Stevens Fall Suite 241, New Bryanborough, MT 58909',16,'2019-04-27','Intern','Terminated','2025-04-10 14:56:59'),(6,2,5,3,3,18,'Roger','Hayden','Other','2002-07-07','josepherickson@gmail.com','665-648-4447','4008 Andre Lane, Amberborough, ME 38429',1,'2017-09-27','Full-time','Inactive','2025-04-10 14:56:59'),(7,4,1,1,3,18,'Jason','Martin','Male','1968-02-23','csnyder@hotmail.com','043-093-5431','28472 Amy Vista Suite 873, East Paul, VT 81064',15,'2023-04-20','Contract','Terminated','2025-04-10 14:56:59'),(8,2,3,2,3,18,'Eric','Cook','Other','1998-03-29','riveratheresa@hotmail.com','599-655-7866','1150 Ashley Cove, East Patricia, FL 65466',17,'2020-08-12','Part-time','Active','2025-04-10 14:56:59'),(9,5,2,4,3,18,'Stacy','Patterson','Other','1989-08-27','mathewwagner@higgins.com','5565722836','6854 Conway Spurs, Port Jaytown, MS 53540',14,'2017-09-30','Full-time','Inactive','2025-04-10 14:56:59'),(10,4,1,5,3,18,'Diane','Johnson','Female','1995-10-30','robertsgabrielle@miller.info','884.650.6880','23634 Keller Curve, Maryhaven, OK 72927',9,'2017-06-12','Full-time','Inactive','2025-04-10 14:56:59'),(11,5,4,4,3,18,'Angela','Henderson','Female','1993-09-30','laurapittman@williams.com','+1-286-607-2406x6135','71048 Ryan Causeway, South Kyle, IA 30002',4,'2022-02-28','Full-time','Inactive','2025-04-10 14:56:59'),(12,3,4,2,3,18,'Krista','Lara','Female','1965-06-20','egarcia@yahoo.com','001-322-100-3871x342','145 Kristina Harbors, Scottville, NY 52769',16,'2019-03-01','Intern','Inactive','2025-04-10 14:56:59'),(13,3,5,3,3,18,'Christina','Thomas','Male','1988-11-04','amy83@hotmail.com','594.837.1081x966','44439 Steven Dale, East Kevinville, NV 09082',7,'2019-08-03','Intern','Active','2025-04-10 14:56:59'),(14,2,3,1,3,18,'Ashlee','Abbott','Female','1966-08-02','erica78@rivera-collins.com','+1-076-660-3428','7391 Jensen Parkway Suite 589, North Jeffport, ID 72058',12,'2015-06-16','Full-time','Active','2025-04-10 14:56:59'),(15,4,4,1,3,18,'Raymond','Duncan','Female','1998-04-30','william48@hotmail.com','784-284-3415x4153','57551 Perkins Rapids, Johnsonborough, OR 76044',12,'2022-02-02','Contract','Terminated','2025-04-10 14:56:59'),(16,2,1,3,3,18,'Amy','Aguilar','Female','1997-03-09','annchavez@yahoo.com','(408)505-4590x8055','90000 Cheryl Circles Suite 656, Davidstad, IN 35437',14,'2024-05-17','Part-time','Terminated','2025-04-10 14:56:59'),(17,5,1,2,3,18,'Frederick','Page','Other','1976-01-23','garrett12@hotmail.com','039-924-9775','5315 Stewart Shoal Suite 793, Thomasmouth, GA 40512',8,'2018-06-17','Part-time','Active','2025-04-10 14:56:59'),(18,5,3,5,3,18,'Grant','Anderson','Other','2001-01-05','jmoyer@gmail.com','333.270.0403','666 Paul Flats, West Matthew, CA 63597',18,'2015-12-05','Part-time','Active','2025-04-10 14:56:59'),(19,5,3,2,3,18,'Brittney','Harris','Female','2002-05-20','wadescott@yahoo.com','489-612-4161x505','0910 Lori Island Apt. 295, Derekstad, KS 44882',18,'2019-05-13','Full-time','Active','2025-04-10 14:56:59'),(20,3,5,4,3,18,'Regina','Miller','Female','1981-01-04','rodney18@ruiz.com','858.253.7442x5592','649 Nathaniel Stravenue, Marquezborough, WY 65782',8,'2018-05-30','Full-time','Active','2025-04-10 14:56:59'),(21,3,4,2,3,18,'Casey','Medina','Female','1982-08-16','rebeccaacosta@yahoo.com','978.895.8801x78555','2466 Jennifer Park, West Eileen, OH 51139',20,'2022-03-19','Intern','Terminated','2025-04-10 14:56:59'),(22,5,5,4,3,18,'Crystal','Wilson','Other','1974-07-10','dennistravis@morse-nixon.net','+1-884-589-1016x189','72610 Nunez Station Apt. 941, New Edward, NH 06565',20,'2017-09-27','Intern','Inactive','2025-04-10 14:56:59'),(23,1,4,3,3,18,'Anthony','Schmidt','Other','1987-11-30','fred49@yahoo.com','(564)337-0531','530 Craig Divide, Harrisside, PA 79159',18,'2017-05-14','Full-time','Terminated','2025-04-10 14:56:59'),(24,3,3,4,3,18,'Janet','Sutton','Other','1999-03-18','neil13@hobbs.com','623-626-4405','PSC 7855, Box 0832, APO AP 98504',1,'2016-11-08','Contract','Active','2025-04-10 14:56:59'),(25,1,5,4,3,18,'Rhonda','Murphy','Female','1979-03-25','johnsonkathleen@mullen-roy.net','933-264-8048x6226','303 Victoria Fort Apt. 483, Tracymouth, AK 60876',19,'2023-03-21','Contract','Inactive','2025-04-10 14:56:59'),(26,2,2,3,3,18,'Ronnie','Stephens','Male','1988-06-20','john91@hotmail.com','+1-390-271-1247','0227 Rebecca Ville Suite 204, West Frankhaven, MD 60240',20,'2019-04-23','Contract','Active','2025-04-10 14:56:59'),(27,4,4,2,3,18,'Jennifer','Singleton','Other','1975-12-14','dmoore@yahoo.com','936-795-6524x723','52881 Fuller Points Suite 484, West Jacobtown, SD 96890',16,'2022-05-20','Contract','Active','2025-04-10 14:56:59'),(28,3,5,2,3,18,'Jeffrey','Wilson','Male','1981-05-02','combsmichael@hotmail.com','(726)816-9126x26481','203 Connie Loaf, New Anthonyshire, ME 78522',14,'2025-03-21','Part-time','Active','2025-04-10 14:56:59'),(29,1,5,5,3,18,'Jeffrey','Peterson','Female','1976-06-06','rsmith@yahoo.com','(183)219-2706x1098','4695 Hernandez Plaza Apt. 156, South Bridgetport, HI 59319',11,'2017-10-26','Contract','Terminated','2025-04-10 14:56:59'),(30,3,5,1,3,18,'Jessica','Gates','Female','2003-03-05','robertwood@flowers-mills.biz','(290)122-5075x30937','524 Gwendolyn Shore, Brendaview, NH 40421',4,'2021-11-05','Intern','Active','2025-04-10 14:56:59'),(31,4,4,3,3,18,'Robert','Jacobs','Other','1975-06-12','nramirez@gmail.com','516-518-0018x43859','4942 Mays Mountain, New Deborah, TX 75627',3,'2016-04-07','Intern','Active','2025-04-10 14:56:59'),(32,1,3,4,3,18,'Michelle','Smith','Other','1992-05-05','adavis@holt.org','(526)334-7287','PSC 1139, Box 3101, APO AA 72263',7,'2017-07-01','Full-time','Inactive','2025-04-10 14:56:59'),(33,1,1,1,3,18,'Elizabeth','Chambers','Male','1987-01-03','amandawilliams@martinez.biz','9899759596','784 Johnson Extension Suite 969, North Sean, KS 12613',4,'2019-12-26','Intern','Terminated','2025-04-10 14:56:59'),(34,5,5,5,3,18,'Kelly','Scott','Male','1992-04-30','patricia87@gmail.com','+1-778-251-4445','USNS Gordon, FPO AA 96413',6,'2017-07-27','Intern','Active','2025-04-10 14:56:59'),(35,3,2,2,3,18,'Brianna','Buchanan','Male','1979-03-25','djames@hotmail.com','(648)605-5890','5893 Zachary Key Suite 535, East Robertview, NE 63197',3,'2015-05-29','Contract','Inactive','2025-04-10 14:56:59'),(36,3,1,4,3,18,'Elizabeth','Mcbride','Other','1982-10-07','qmedina@gmail.com','001-864-581-6549x728','55801 West Valley, Catherinehaven, RI 01496',1,'2016-03-02','Intern','Active','2025-04-10 14:56:59'),(37,1,1,3,3,18,'Donald','Gomez','Female','1974-12-30','alyssaswanson@hotmail.com','+1-501-365-8750','293 Gerald Crossing, North Michaelton, WY 11529',1,'2023-10-21','Full-time','Terminated','2025-04-10 14:56:59'),(38,2,3,5,3,18,'Brandy','Rush','Male','1987-06-08','walkerdylan@gmail.com','001-511-371-4571x589','04262 Melissa Glens, North Morganshire, FL 91713',3,'2023-04-21','Part-time','Active','2025-04-10 14:56:59'),(39,3,3,5,3,18,'Jodi','Myers','Male','1978-03-19','dixondennis@gmail.com','(029)502-8032x3340','0072 Cox Isle Suite 129, Camachotown, OK 01858',5,'2015-07-31','Part-time','Inactive','2025-04-10 14:56:59'),(40,4,5,4,3,18,'Norma','Mosley','Male','1985-06-19','wmckinney@hotmail.com','(749)191-5231x6565','246 Lewis Tunnel, Port Meganland, NH 44131',9,'2024-11-26','Intern','Inactive','2025-04-10 14:56:59'),(41,5,3,4,3,18,'Morgan','Allen','Male','1972-12-12','hwilson@yahoo.com','275.748.9546','55330 Price Stream, South Kaylaland, MS 47878',6,'2016-07-23','Full-time','Active','2025-04-10 14:56:59'),(42,5,4,5,3,18,'Ashley','Brady','Male','1999-04-08','brentlopez@norton-ballard.com','978.656.6811x0868','PSC 5731, Box 8840, APO AE 51253',19,'2019-12-06','Part-time','Active','2025-04-10 14:56:59'),(43,2,5,5,3,18,'Patricia','Rowland','Female','1982-01-03','millsbrian@powers.com','646.598.4181x303','62012 Aaron Springs Suite 893, South Benjaminmouth, IL 86046',16,'2018-02-20','Full-time','Terminated','2025-04-10 14:56:59'),(44,4,5,5,3,18,'Erin','Hood','Other','1990-07-12','josephbarker@anderson-nguyen.com','+1-893-548-6027x0724','962 Rogers Stravenue, Adamsview, IA 45637',15,'2021-01-09','Full-time','Terminated','2025-04-10 14:56:59'),(45,4,4,1,3,18,'Joshua','Thomas','Male','1975-05-12','ericastephens@miller.net','457.342.9713x5812','62921 Drake Knoll Suite 418, New John, NJ 56802',14,'2018-03-20','Part-time','Terminated','2025-04-10 14:56:59'),(46,1,3,5,3,18,'Michelle','Johnson','Female','1965-12-25','mossjeffrey@hotmail.com','730-216-6692','USCGC Patel, FPO AE 29335',13,'2022-05-19','Part-time','Inactive','2025-04-10 14:56:59'),(47,1,2,5,3,18,'Peggy','Johnson','Other','1975-01-28','gboyer@yahoo.com','(869)670-2487','PSC 3735, Box 9721, APO AE 36604',10,'2016-06-27','Intern','Terminated','2025-04-10 14:56:59'),(48,5,1,2,3,18,'Nicholas','Smith','Other','1998-01-27','tonyjackson@yahoo.com','178.068.3797x8680','USCGC Hanson, FPO AP 77120',7,'2025-02-26','Intern','Active','2025-04-10 14:56:59'),(49,2,2,1,3,18,'Jimmy','Carlson','Other','1993-06-16','xthomas@yahoo.com','200.175.2745x89746','1681 Clark Villages Suite 958, Amandatown, KY 40373',6,'2016-05-21','Part-time','Terminated','2025-04-10 14:56:59'),(50,2,5,3,3,18,'Paige','Macias','Female','1973-09-09','leejason@yahoo.com','(379)325-4146x291','Unit 4267 Box 8536, DPO AE 33354',5,'2020-10-29','Intern','Inactive','2025-04-10 14:56:59');
/*!40000 ALTER TABLE `emp_employee` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `modules`
--

DROP TABLE IF EXISTS `modules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `modules` (
  `id` int NOT NULL AUTO_INCREMENT,
  `module_key` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `name` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `module_key` (`module_key`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `modules`
--

LOCK TABLES `modules` WRITE;
/*!40000 ALTER TABLE `modules` DISABLE KEYS */;
INSERT INTO `modules` VALUES (1,'attendance','Attendance','Manage employee check-ins, check-outs, leaves, and presence tracking.',1),(2,'payroll','Payroll','Handle salary processing, payslips, deductions, and bonuses.',1),(3,'performance','Performance','Track and review employee performance, goals, and KPIs.',1),(4,'events','Events','Manage company events, meetings, and announcements.',1),(5,'recruitment','Recruitment','Manage job openings, applications, interviews, and onboarding.',1),(6,'leaves','Leave Management','Track leave requests, approvals, and balances.',1),(7,'assets','Asset Management','Assign, track, and recover employee equipment and resources.',1),(8,'training','Training','Schedule and manage employee training sessions and materials.',1),(9,'travel','Travel','Handle travel requests, approvals, and reimbursements.',1),(10,'documents','Document Center','Store and manage company and employee documents.',1),(11,'compliance','Compliance','Manage legal and policy compliance documents.',1),(12,'inventory','Inventory Management','Track and manage stock and materials.',1),(13,'helpdesk','Helpdesk','Support ticketing and customer issue management.',1),(14,'projects','Project Management','Plan, assign, and monitor project tasks.',1),(15,'crm','Customer Relations','Maintain customer profiles and communication logs.',1),(16,'audit','Audit','Track internal and external audit records.',1),(17,'budget','Budget Planning','Define and monitor annual budgets.',1),(18,'vendor','Vendor Management','Manage supplier profiles and contracts.',1),(19,'reports','Reports Center','Generate organization-wide analytical reports.',1),(20,'settings','Global Settings','Configure global system preferences.',1);
/*!40000 ALTER TABLE `modules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `organization_hierarchy`
--

DROP TABLE IF EXISTS `organization_hierarchy`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `organization_hierarchy` (
  `hierarchy_id` int NOT NULL AUTO_INCREMENT,
  `company_id` int NOT NULL,
  `position_id` int NOT NULL,
  `reports_to_position_id` int DEFAULT NULL,
  `hierarchy_level` int DEFAULT NULL COMMENT 'Defines vertical order — 1=Top (CEO), 2=VP, 3=Manager, etc.',
  `description` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `effective_from` date DEFAULT NULL,
  `effective_to` date DEFAULT NULL,
  PRIMARY KEY (`hierarchy_id`),
  KEY `fk_org_position` (`position_id`),
  KEY `fk_org_reports_to` (`reports_to_position_id`),
  KEY `fk_org_company` (`company_id`),
  CONSTRAINT `fk_org_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`company_id`),
  CONSTRAINT `fk_org_position` FOREIGN KEY (`position_id`) REFERENCES `positions` (`position_id`),
  CONSTRAINT `fk_org_reports_to` FOREIGN KEY (`reports_to_position_id`) REFERENCES `positions` (`position_id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organization_hierarchy`
--

LOCK TABLES `organization_hierarchy` WRITE;
/*!40000 ALTER TABLE `organization_hierarchy` DISABLE KEYS */;
INSERT INTO `organization_hierarchy` VALUES (1,1,1,NULL,1,'Chairman – topmost position in the organization','2025-01-01',NULL),(2,1,2,1,2,'Board of Directors reports to Chairman','2025-01-01',NULL),(3,1,3,2,3,'CEO reports to Board of Directors','2025-01-01',NULL),(4,1,4,3,4,'COO reports to CEO','2025-01-01',NULL),(5,1,5,3,4,'CFO reports to CEO','2025-01-01',NULL),(6,1,6,3,4,'CTO reports to CEO','2025-01-01',NULL),(7,1,20,3,5,'Executive Assistant reports to CEO','2025-01-01',NULL),(8,1,7,4,5,'VP of Operations reports to COO','2025-01-01',NULL),(9,1,9,7,6,'Director of Manufacturing reports to VP of Operations','2025-01-01',NULL),(10,1,10,9,7,'Senior Operations Manager reports to Director of Manufacturing','2025-01-01',NULL),(11,1,11,10,8,'Operations Manager reports to Senior Operations Manager','2025-01-01',NULL),(12,1,12,11,9,'Production Team Lead reports to Operations Manager','2025-01-01',NULL),(13,1,13,12,10,'Factory Worker reports to Production Team Lead','2025-01-01',NULL),(14,1,14,13,11,'Sweeper reports to Factory Worker','2025-01-01',NULL),(15,1,17,10,9,'Operations Coordinator reports to Senior Operations Manager','2025-01-01',NULL),(16,1,8,5,5,'VP of Finance reports to CFO','2025-01-01',NULL),(17,1,15,8,6,'Finance Analyst reports to VP of Finance','2025-01-01',NULL),(18,1,19,8,7,'Intern - HR reports to VP of Finance','2025-01-01',NULL),(19,1,16,6,5,'IT Consultant reports to CTO','2025-01-01',NULL),(20,1,18,6,6,'Junior Developer reports to CTO','2025-01-01',NULL);
/*!40000 ALTER TABLE `organization_hierarchy` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `module_id` int DEFAULT NULL,
  `permission_key` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `permission_key` (`permission_key`),
  KEY `module_id` (`module_id`),
  CONSTRAINT `permissions_ibfk_1` FOREIGN KEY (`module_id`) REFERENCES `modules` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permissions`
--

LOCK TABLES `permissions` WRITE;
/*!40000 ALTER TABLE `permissions` DISABLE KEYS */;
INSERT INTO `permissions` VALUES (1,1,'attendance.view','View attendance records'),(2,1,'attendance.mark','Mark daily attendance'),(3,1,'attendance.approve','Approve attendance corrections'),(4,1,'attendance.report','Generate attendance reports'),(5,2,'payroll.view','View payroll details'),(6,2,'payroll.process','Process salaries'),(7,2,'payroll.edit','Edit payroll components'),(8,2,'payroll.payslip','Generate payslips'),(9,3,'performance.view','View performance records'),(10,3,'performance.review','Submit performance review'),(11,3,'performance.approve','Approve performance ratings'),(12,4,'events.view','View company events'),(13,4,'events.create','Create new events'),(14,4,'events.edit','Edit existing events'),(15,4,'events.delete','Delete events'),(16,5,'recruitment.view','View job applications'),(17,5,'recruitment.create','Post job openings'),(18,5,'recruitment.schedule','Schedule interviews'),(19,5,'recruitment.hire','Mark candidate as hired'),(20,6,'leaves.view','View leave balances'),(21,6,'leaves.apply','Apply for leave'),(22,6,'leaves.approve','Approve/reject leave requests'),(23,6,'leaves.report','Generate leave reports'),(24,7,'assets.view','View assigned assets'),(25,7,'assets.assign','Assign assets to employees'),(26,7,'assets.recover','Recover returned assets'),(27,7,'assets.manage','Add/edit/remove assets'),(28,8,'training.view','View training sessions'),(29,8,'training.schedule','Schedule new training'),(30,8,'training.mark','Mark training completion'),(31,8,'training.report','View training reports'),(32,9,'travel.view','View travel requests'),(33,9,'travel.apply','Apply for travel'),(34,9,'travel.approve','Approve/reject travel requests'),(35,9,'travel.reimburse','Process travel reimbursement'),(36,10,'documents.view','View documents'),(37,10,'documents.upload','Upload documents'),(38,10,'documents.edit','Edit document metadata'),(39,10,'documents.delete','Delete documents'),(40,11,'compliance.view','View compliance documents'),(41,11,'compliance.upload','Upload new compliance records'),(42,12,'inventory.view','View inventory list'),(43,12,'inventory.update','Update stock quantities'),(44,13,'helpdesk.create','Create support tickets'),(45,13,'helpdesk.assign','Assign support tickets'),(46,14,'projects.view','View assigned projects'),(47,14,'projects.manage','Manage project resources'),(48,15,'crm.view','View customer records'),(49,15,'crm.edit','Edit customer information');
/*!40000 ALTER TABLE `permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `positions`
--

DROP TABLE IF EXISTS `positions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `positions` (
  `position_id` int NOT NULL AUTO_INCREMENT COMMENT 'This table represents job titles like "Software Engineer", "HR Manager", etc.\r\n\r\nThe role_level column is likely referencing what level of role it is, possibly mapped to the roles table.',
  `position_name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`position_id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `positions`
--

LOCK TABLES `positions` WRITE;
/*!40000 ALTER TABLE `positions` DISABLE KEYS */;
INSERT INTO `positions` VALUES (1,'Chairman'),(2,'Board of Directors'),(3,'CEO'),(4,'COO'),(5,'CFO'),(6,'CTO'),(7,'VP of Operations'),(8,'VP of Finance'),(9,'Director of Manufacturing'),(10,'Senior Operations Manager'),(11,'Operations Manager'),(12,'Production Team Lead'),(13,'Factory Worker'),(14,'Sweeper'),(15,'Finance Analyst'),(16,'IT Consultant'),(17,'Operations Coordinator'),(18,'Junior Developer'),(19,'Intern - HR'),(20,'Executive Assistant');
/*!40000 ALTER TABLE `positions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_permission_scope`
--

DROP TABLE IF EXISTS `role_permission_scope`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_permission_scope` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role_permission_id` int NOT NULL,
  `branch_id` int DEFAULT NULL,
  `department_id` int DEFAULT NULL,
  `employee_id` int DEFAULT NULL,
  `scope_type` enum('GLOBAL','BRANCH','DEPARTMENT','EMPLOYEE') COLLATE utf8mb4_general_ci DEFAULT 'GLOBAL',
  `description` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_rp_scope_role_permission` (`role_permission_id`),
  KEY `fk_rp_scope_branch` (`branch_id`),
  KEY `fk_rp_scope_department` (`department_id`),
  KEY `fk_rp_scope_employee` (`employee_id`),
  CONSTRAINT `fk_rp_scope_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`branch_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_rp_scope_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_rp_scope_employee` FOREIGN KEY (`employee_id`) REFERENCES `emp_employee` (`employee_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_rp_scope_role_permission` FOREIGN KEY (`role_permission_id`) REFERENCES `role_permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_permission_scope`
--

LOCK TABLES `role_permission_scope` WRITE;
/*!40000 ALTER TABLE `role_permission_scope` DISABLE KEYS */;
INSERT INTO `role_permission_scope` VALUES (1,1,NULL,NULL,NULL,'GLOBAL','Super Admin: Global Access (All Modules)'),(2,2,NULL,NULL,NULL,'GLOBAL','Super Admin: Global Access (All Modules)'),(3,3,NULL,NULL,NULL,'GLOBAL','Super Admin: Global Access (All Modules)'),(4,4,NULL,NULL,NULL,'GLOBAL','Super Admin: Global Access (All Modules)'),(5,16,1,NULL,NULL,'BRANCH','Admin: Limited to New York Branch'),(6,17,1,NULL,NULL,'BRANCH','Admin: Limited to New York Branch'),(7,18,1,NULL,NULL,'BRANCH','Admin: Limited to New York Branch'),(8,19,1,NULL,NULL,'BRANCH','Admin: Limited to New York Branch'),(9,26,NULL,1,NULL,'DEPARTMENT','Manager: Limited to HR Department'),(10,27,NULL,1,NULL,'DEPARTMENT','Manager: Limited to HR Department'),(11,28,NULL,1,NULL,'DEPARTMENT','Manager: Limited to HR Department'),(12,29,NULL,1,NULL,'DEPARTMENT','Manager: Limited to HR Department'),(18,54,1,NULL,NULL,'BRANCH','Scope assigned for Manager - compliance.upload at New York Branch'),(19,54,2,NULL,NULL,'BRANCH','Scope assigned for Manager - compliance.upload at London Office'),(20,54,3,NULL,NULL,'BRANCH','Scope assigned for Manager - compliance.upload at Mumbai Hub'),(21,54,4,NULL,NULL,'BRANCH','Scope assigned for Manager - compliance.upload at Sydney Division'),(22,54,5,NULL,NULL,'BRANCH','Scope assigned for Manager - compliance.upload at Dubai Regional'),(23,53,1,NULL,NULL,'BRANCH','Scope assigned for Manager - compliance.view at New York Branch'),(24,53,2,NULL,NULL,'BRANCH','Scope assigned for Manager - compliance.view at London Office'),(25,53,3,NULL,NULL,'BRANCH','Scope assigned for Manager - compliance.view at Mumbai Hub'),(26,53,4,NULL,NULL,'BRANCH','Scope assigned for Manager - compliance.view at Sydney Division'),(27,53,5,NULL,NULL,'BRANCH','Scope assigned for Manager - compliance.view at Dubai Regional'),(28,55,NULL,1,NULL,'DEPARTMENT','Extra permission for department 1');
/*!40000 ALTER TABLE `role_permission_scope` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_permissions`
--

DROP TABLE IF EXISTS `role_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_permissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role_id` int NOT NULL,
  `permission_id` int NOT NULL,
  `allowed` tinyint(1) DEFAULT '1',
  `description` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_role` (`role_id`),
  KEY `fk_permission` (`permission_id`),
  CONSTRAINT `fk_permission` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`),
  CONSTRAINT `fk_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`)
) ENGINE=InnoDB AUTO_INCREMENT=63 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_permissions`
--

LOCK TABLES `role_permissions` WRITE;
/*!40000 ALTER TABLE `role_permissions` DISABLE KEYS */;
INSERT INTO `role_permissions` VALUES (1,1,1,1,'Super Admin: Full Access (Attendance Module)'),(2,1,2,1,'Super Admin: Full Access (Attendance Module)'),(3,1,3,1,'Super Admin: Full Access (Attendance Module)'),(4,1,4,1,'Super Admin: Full Access (Attendance Module)'),(5,1,5,1,'Super Admin: Full Access (Payroll Module)'),(6,1,6,1,'Super Admin: Full Access (Payroll Module)'),(7,1,7,1,'Super Admin: Full Access (Employee Module)'),(8,1,8,1,'Super Admin: Full Access (Employee Module)'),(9,1,9,1,'Super Admin: Full Access (Employee Module)'),(10,1,10,1,'Super Admin: Full Access (Employee Module)'),(11,1,11,1,'Super Admin: Full Access (Leave Module)'),(12,1,12,1,'Super Admin: Full Access (Leave Module)'),(13,1,13,1,'Super Admin: Full Access (Finance Module)'),(14,1,14,1,'Super Admin: Full Access (Finance Module)'),(15,1,15,1,'Super Admin: Full Access (Settings Module)'),(16,2,1,1,'Admin: All except Finance & Settings'),(17,2,2,1,'Admin: All except Finance & Settings'),(18,2,3,1,'Admin: All except Finance & Settings'),(19,2,4,1,'Admin: All except Finance & Settings'),(20,2,5,1,'Admin: All except Finance & Settings'),(21,2,6,1,'Admin: All except Finance & Settings'),(22,2,7,1,'Admin: All except Finance & Settings'),(23,2,8,1,'Admin: All except Finance & Settings'),(24,2,9,1,'Admin: All except Finance & Settings'),(25,2,10,1,'Admin: All except Finance & Settings'),(26,3,1,1,'HR Manager: Manage Employees, Attendance & Leaves'),(27,3,2,1,'HR Manager: Manage Employees, Attendance & Leaves'),(28,3,3,1,'HR Manager: Manage Employees, Attendance & Leaves'),(29,3,4,1,'HR Manager: Manage Employees, Attendance & Leaves'),(30,3,7,1,'HR Manager: Manage Employees, Attendance & Leaves'),(31,3,8,1,'HR Manager: Manage Employees, Attendance & Leaves'),(32,3,9,1,'HR Manager: Manage Employees, Attendance & Leaves'),(33,3,11,1,'HR Manager: Manage Employees, Attendance & Leaves'),(34,3,12,1,'HR Manager: Manage Employees, Attendance & Leaves'),(35,4,5,1,'Finance Officer: Finance + Payroll + Reports'),(36,4,6,1,'Finance Officer: Finance + Payroll + Reports'),(37,4,13,1,'Finance Officer: Finance + Payroll + Reports'),(38,4,14,1,'Finance Officer: Finance + Payroll + Reports'),(39,5,1,1,'Employee: View Own Attendance'),(40,5,5,1,'Employee: View Own Payroll'),(41,5,7,1,'Employee: View Own Profile'),(42,5,11,1,'Employee: View Own Leave History'),(53,3,40,1,'Manager: View compliance documents'),(54,3,41,1,'Manager: Upload compliance records'),(55,4,42,1,'Team Lead: View inventory'),(56,4,43,1,'Team Lead: Update inventory stock'),(57,5,44,1,'Senior Developer: Create helpdesk ticket'),(58,5,45,1,'Senior Developer: Assign helpdesk ticket'),(59,6,46,1,'Developer: View projects'),(60,6,47,1,'Developer: Manage assigned project tasks'),(61,7,48,1,'QA Engineer: View customer records'),(62,7,49,1,'QA Engineer: Edit customer notes');
/*!40000 ALTER TABLE `role_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `role_id` int NOT NULL AUTO_INCREMENT COMMENT 'this table define responsibility level or classification',
  `role_name` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `role_level` int NOT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `status_id` int DEFAULT 1 COMMENT '1=Active, 2=Inactive, 3=Archived',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`role_id`),
  UNIQUE KEY `uq_role_level` (`role_level`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'Super Admin',1,'Has full system access including role and user management',1,'2025-04-09 15:05:16','2025-04-09 15:05:16'),(2,'Admin',2,'Can manage users and settings',1,'2025-04-09 15:05:16','2025-04-09 15:05:16'),(3,'Manager',3,'Can view reports and manage team activities',1,'2025-04-09 15:05:16','2025-04-09 15:05:16'),(4,'Team Lead',4,'Leads a small group and has limited management rights',1,'2025-04-09 15:05:16','2025-04-09 15:05:16'),(5,'Senior Developer',5,'Experienced developer with deployment rights',1,'2025-04-09 15:05:16','2025-04-09 15:05:16'),(6,'Developer',6,'Can access and contribute to the development environment',1,'2025-04-09 15:05:16','2025-04-09 15:05:16'),(7,'QA Engineer',7,'Responsible for testing and quality assurance',1,'2025-04-09 15:05:16','2025-04-09 15:05:16'),(8,'Support Staff',8,'Handles customer issues and provides technical support',1,'2025-04-09 15:05:16','2025-04-09 15:05:16'),(9,'Intern',9,'Limited access for learning and assisting tasks',1,'2025-04-09 15:05:16','2025-04-09 15:05:16'),(10,'Guest',10,'Can only view public information',1,'2025-04-09 15:05:16','2025-04-09 15:05:16');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `status`
--

DROP TABLE IF EXISTS `status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `status` (
  `status_id` int NOT NULL AUTO_INCREMENT,
  `status_name` enum('Active','Inactive','Archived','Terminated','Resigned','On hold','Pending') DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`status_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `status`
--

LOCK TABLES `status` WRITE;
/*!40000 ALTER TABLE `status` DISABLE KEYS */;
INSERT INTO `status` VALUES (1,'Active','2025-11-19 11:43:39','2025-11-19 11:43:39'),(2,'Inactive','2025-11-19 11:43:39','2025-11-19 11:43:39'),(3,'Archived','2025-11-19 11:43:39','2025-11-19 11:43:39'),(4,'Terminated','2025-11-19 11:43:39','2025-11-19 11:43:39'),(5,'Resigned','2025-11-19 11:43:39','2025-11-19 11:43:39'),(6,'On hold','2025-11-19 11:43:39','2025-11-19 11:43:39'),(7,'Pending','2025-11-19 11:43:39','2025-11-19 11:43:39');
/*!40000 ALTER TABLE `status` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-26 10:41:46
CREATE TABLE biometric_logs(
  log_id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  device_id VARCHAR(50),
  punch_time DATETIME NOT NULL,
  punch_type ENUM('IN','OUT','AUTO') DEFAULT 'AUTO',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(employee_id) REFERENCES emp_employee(employee_id)
);

CREATE TABLE daily_attendance(
  attendance_id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  date DATE NOT NULL,
  first_in_time DATETIME,
  last_out_time DATETIME,
  total_working_hours TIME,
  total_punches INT DEFAULT 0,
  status ENUM('Present','Absent','Leave','Holiday','Week Off','Regularized') DEFAULT 'Absent',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE(employee_id, date),
  FOREIGN KEY(employee_id) REFERENCES emp_employee(employee_id)
);

CREATE TABLE shifts(
  shift_id INT AUTO_INCREMENT PRIMARY KEY,
  shift_name VARCHAR(50) NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_duration INT DEFAULT 0, -- in minutes
  grace_time_minutes INT DEFAULT 0,
  status_id INT DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(status_id) REFERENCES status(status_id)
);

CREATE TABLE leave_type(
  leave_type_id INT AUTO_INCREMENT PRIMARY KEY,
  leave_type_name VARCHAR(50) NOT NULL,
  description TEXT,
  status_id INT DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY(status_id) REFERENCES status(status_id)
);

CREATE TABLE leave_allocation_rules(
  rule_id INT AUTO_INCREMENT PRIMARY KEY,
  leave_type_id INT NOT NULL,
  allocation_period ENUM('Monthly','Yearly') NOT NULL,
  days_allocated INT NOT NULL,
  carry_forward BOOLEAN DEFAULT FALSE,
  max_carry_forward_days INT DEFAULT 0,
  status_id INT DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY(leave_type_id) REFERENCES leave_type(leave_type_id),
  FOREIGN KEY(status_id) REFERENCES status(status_id)
);

CREATE TABLE leaves_request(
  leave_id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  leave_type_id INT NOT NULL,
  requested_to INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  request_date DATE NOT NULL,
  status ENUM('Pending', 'Approved', 'Rejected', 'Cancelled') DEFAULT 'Pending',
  comments TEXT,
  approved_by INT DEFAULT NULL,
  approved_date DATE DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY(employee_id) REFERENCES emp_employee(employee_id),
  FOREIGN KEY(leave_type_id) REFERENCES leave_type(leave_type_id),
  FOREIGN KEY(requested_to) REFERENCES emp_employee(employee_id),
  FOREIGN KEY(approved_by) REFERENCES emp_employee(employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE employee_leave_balance(
  balance_id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  leave_type_id INT NOT NULL,
  year YEAR NOT NULL,
  total_allocated DECIMAL(5,2),
  used DECIMAL(5,2),
  remaining DECIMAL(5,2),
  carried_forward DECIMAL(5,2),
  last_updated DATETIME,
  FOREIGN KEY(employee_id) REFERENCES emp_employee(employee_id),
  FOREIGN KEY(leave_type_id) REFERENCES leave_type(leave_type_id)
);

CREATE TABLE leave_balance_history(
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  leave_type_id INT NOT NULL,
  transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  transaction_type ENUM('Credit','Debit','Carry Forward','Adjustment') NOT NULL,
  days_changed DECIMAL(5,2) NOT NULL,
  remarks VARCHAR(255),
  performed_by INT,
  resulting_balance DECIMAL(5,2),
  FOREIGN KEY(employee_id) REFERENCES emp_employee(employee_id),
  FOREIGN KEY(leave_type_id) REFERENCES leave_type(leave_type_id),
  FOREIGN KEY(performed_by) REFERENCES emp_employee(employee_id)
);

CREATE TABLE holiday_calendar(
  holiday_id INT AUTO_INCREMENT PRIMARY KEY,
  holiday_name VARCHAR(100) NOT NULL,
  holiday_date DATE NOT NULL,
  holiday_type ENUM('Public','Restricted') DEFAULT 'Public',
  branch_id INT DEFAULT NULL,
  description TEXT,
  status_id INT DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE(holiday_date, branch_id),
  FOREIGN KEY(branch_id) REFERENCES branches(branch_id),
  FOREIGN KEY(status_id) REFERENCES status(status_id)
);

CREATE TABLE attendance_devices(
  device_id VARCHAR(50) PRIMARY KEY,
  device_ip VARCHAR(50),
  device_serial_number VARCHAR(100),
  device_name VARCHAR(100),
  location VARCHAR(100),
  status_id INT DEFAULT 1,
  last_synced DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(status_id) REFERENCES status(status_id)
);

CREATE TABLE notifications(
  notification_id INT AUTO_INCREMENT PRIMARY KEY,
  type ENUM('leave','regularization','manual_attendance') NOT NULL,
  status ENUM('pending','approved','rejected','cancelled') DEFAULT 'pending',
  reference_id INT NOT NULL,
  sent_to INT NOT NULL,
  sent_by INT NOT NULL,
  seen_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(sent_to) REFERENCES emp_employee(employee_id),
  FOREIGN KEY(sent_by) REFERENCES emp_employee(employee_id)
);

CREATE TABLE attendance_regularization_requests (
  request_id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  date DATE NOT NULL,
  old_check_in TIME NULL,
  old_check_out TIME NULL,
  corrected_check_in TIME NULL,
  corrected_check_out TIME NULL,
  regularization_type ENUM('Missed Punch','Incorrect Punch','Work From Home','Outdoor Duty','System Error') NOT NULL,
  reason TEXT NOT NULL,
  status ENUM('Pending','Approved','Rejected') DEFAULT 'Pending',
  approved_by INT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES emp_employee(employee_id),
  FOREIGN KEY (approved_by) REFERENCES emp_employee(employee_id)
);
 
ALTER table att_regularization_requests

modify column regularization_type ENUM(

'forgot to checkin',

    'forgot to checkout',

    'Work From Home') Not Null;
 

CREATE TABLE manual_attendance_entries(
  entry_id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  date DATE NOT NULL,
  in_time TIME,
  out_time TIME,
  location VARCHAR(100),
  reason TEXT,
  entered_by INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY(employee_id) REFERENCES emp_employee(employee_id),
  FOREIGN KEY(entered_by) REFERENCES emp_employee(employee_id)
);

CREATE TABLE restricted_holiday_usage(
  usage_id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  holiday_id INT NOT NULL,
  year YEAR NOT NULL,
  approved_by INT DEFAULT NULL,
  approved_at DATETIME DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(employee_id) REFERENCES emp_employee(employee_id),
  FOREIGN KEY(holiday_id) REFERENCES holiday_calendar(holiday_id),
  FOREIGN KEY(approved_by) REFERENCES emp_employee(employee_id),
  UNIQUE(employee_id, holiday_id, year)
);

CREATE TABLE employee_shift_assignments(
  assignment_id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  shift_id INT NOT NULL,
  effective_from DATE NOT NULL,
  effective_to DATE DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY(employee_id) REFERENCES emp_employee(employee_id),
  FOREIGN KEY(shift_id) REFERENCES shifts(shift_id)
);

RENAME TABLE biometric_logs TO att_biometric_logs;
RENAME TABLE daily_attendance TO att_daily_attendance;
RENAME TABLE shifts TO att_shifts;
RENAME TABLE leave_type TO att_leave_type;
RENAME TABLE leave_allocation_rules TO att_leave_alloc_rules;
RENAME TABLE employee_leave_balance TO att_emp_leave_balance;
RENAME TABLE leave_balance_history TO att_leave_balance_history;
RENAME TABLE holiday_calendar TO att_holiday_calendar;
RENAME TABLE attendance_devices TO att_devices;
RENAME TABLE notifications TO att_notifications;
RENAME TABLE attendance_regularization_requests TO att_regularization_requests;
RENAME TABLE manual_attendance_entries TO att_manual_attendance_entries;
RENAME TABLE restricted_holiday_usage TO att_restricted_holiday_usage;
RENAME TABLE employee_shift_assignments TO att_emp_shift_assignments;
RENAME TABLE leaves_request TO att_leaves_request;

-- Step 1: Add status_id column to emp_employee table
ALTER TABLE `emp_employee` 
ADD COLUMN `status_id` INT DEFAULT 1 COMMENT 'References status.status_id' AFTER `employment_type`;
 
-- Step 2: Migrate existing data from status enum to status_id
-- Mapping: 'Active' -> 1, 'Inactive' -> 2, 'Terminated' -> 4

SET SQL_SAFE_UPDATES = 0;
UPDATE `emp_employee` 
SET `status_id` = CASE 
    WHEN `status` = 'Active' THEN 1
    WHEN `status` = 'Inactive' THEN 2
    WHEN `status` = 'Terminated' THEN 4
    ELSE 1  -- Default to Active if status is NULL or unknown
END;
SET SQL_SAFE_UPDATES = 1;

-- Step 3: Add foreign key constraint
ALTER TABLE `emp_employee`
ADD CONSTRAINT `fk_employee_status` 
FOREIGN KEY (`status_id`) REFERENCES `status` (`status_id`);
 
-- Step 4: Drop the old status enum column
ALTER TABLE `emp_employee`
DROP COLUMN `status`;

---Department to Branch linking table
CREATE TABLE dpt_linkedto_branch (
  id INT NOT NULL AUTO_INCREMENT,
  department_id INT NOT NULL,
  branch_id INT NOT NULL,
  PRIMARY KEY (id),
  KEY idx_department_id (department_id),
  KEY idx_branch_id (branch_id),
  CONSTRAINT fk_dpt_link_department
    FOREIGN KEY (department_id)
    REFERENCES departments(department_id)
    ON DELETE CASCADE,
  CONSTRAINT fk_dpt_link_branch
    FOREIGN KEY (branch_id)
    REFERENCES branches(branch_id)
    ON DELETE CASCADE
);

  -- For data inserting permission
INSERT INTO permissions
(module_id, permission_key, description, permission_type, parent_permission_id, show_in_menu, status)
VALUES
(35, 'roles_page', 'Roles Management', 'PAGE', 72, 1, 1);


INSERT INTO pv_updated.role_permissions (role_id, permission_id, allowed, description)
SELECT 
    2 AS role_id,           -- new role
    permission_id,
    allowed,
    description
FROM pv_updated.role_permissions
WHERE role_id = 1
  AND NOT EXISTS (
      SELECT 1 
      FROM pv_updated.role_permissions r2
      WHERE r2.role_id = 2
        AND r2.permission_id = pv_updated.role_permissions.permission_id
  );
