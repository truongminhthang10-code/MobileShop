-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Apr 30, 2026 at 02:08 PM
-- Server version: 9.1.0
-- PHP Version: 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `mobileshopdb`
--

-- --------------------------------------------------------

--
-- Table structure for table `carts`
--

DROP TABLE IF EXISTS `carts`;
CREATE TABLE IF NOT EXISTS `carts` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `UserId` int NOT NULL,
  `VariantId` int NOT NULL,
  `Quantity` int NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `IX_Carts_UserId` (`UserId`),
  KEY `IX_Carts_VariantId` (`VariantId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
CREATE TABLE IF NOT EXISTS `categories` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Description` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `IsDeleted` tinyint(1) NOT NULL,
  `LogoUrl` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`Id`, `Name`, `Description`, `IsDeleted`, `LogoUrl`) VALUES
(1, 'Apple', 'Các sản phẩm điện thoại iPhone', 0, '/uploads/categories/55574041-4d04-493c-a050-01402fa952d1_apple-logo-vector.webp'),
(2, 'Samsung', 'Các sản phẩm của Samsung', 1, NULL),
(3, 'SamSung', 'Công ty dẫn đầu toàn cầu về công nghệ, điện tử tiêu dùng và viễn thông di động', 0, '/uploads/categories/8435bad6-c3a2-4771-9ea4-a5e24e191425_samsung-logo-on-transparent-background-free-vector.jpg'),
(4, 'Xiaomi', 'Xiaomi là tập đoàn công nghệ Trung Quốc, nổi tiếng với các sản phẩm điện tử tiêu dùng thông minh như smartphone, AIoT', 0, '/uploads/categories/3509b32f-dda0-4fdc-9577-b7026b18ef8b_Xiaomi_logo_(2021-).svg.png'),
(5, 'Oppo', 'OPPO là một trong những nhà sản xuất thiết kế bị điện tử tiêu dùng và truyền thông di động hàng đầu thế giới, nổi tiếng với các dòng điện thoại thông minh đột phá.', 0, '/uploads/categories/d1795d39-6d73-48bc-ab03-00c781ae22c4_OPPO_LOGO_2019.png');

-- --------------------------------------------------------

--
-- Table structure for table `orderitems`
--

DROP TABLE IF EXISTS `orderitems`;
CREATE TABLE IF NOT EXISTS `orderitems` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `OrderId` int NOT NULL,
  `VariantId` int NOT NULL,
  `Quantity` int NOT NULL,
  `UnitPrice` decimal(18,2) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `IX_OrderItems_OrderId` (`OrderId`),
  KEY `IX_OrderItems_VariantId` (`VariantId`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `orderitems`
--

INSERT INTO `orderitems` (`Id`, `OrderId`, `VariantId`, `Quantity`, `UnitPrice`) VALUES
(1, 1, 3, 1, 29000000.00),
(2, 2, 4, 1, 18490000.00);

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
CREATE TABLE IF NOT EXISTS `orders` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `CustomerName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `PhoneNumber` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Address` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `Email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `PaymentMethod` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ShippingMethod` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `TotalAmount` decimal(18,2) NOT NULL,
  `Status` int NOT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  `UserId` int DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `IX_Orders_CreatedAt` (`CreatedAt`),
  KEY `IX_Orders_Status` (`Status`),
  KEY `IX_Orders_UserId` (`UserId`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`Id`, `CustomerName`, `PhoneNumber`, `Address`, `Email`, `PaymentMethod`, `ShippingMethod`, `TotalAmount`, `Status`, `CreatedAt`, `UserId`) VALUES
(1, 'Nguyễn Văn Khách', '0901234567', '123 Đường ABC, Quận 1', NULL, 'MoMo', 'Delivery', 29000000.00, 0, '2026-04-16 22:53:23.000000', NULL),
(2, 'TRUONG MINH THANG', '0374608738', '1041/62/3/14 Trần Xuân Soạn, Khu phố 72, Phường Tân Hưng, Q.7, TP.HCM', NULL, 'COD', 'Delivery', 18490000.00, 1, '2026-04-28 18:15:51.282912', 3);

-- --------------------------------------------------------

--
-- Table structure for table `productimages`
--

DROP TABLE IF EXISTS `productimages`;
CREATE TABLE IF NOT EXISTS `productimages` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `ProductId` int NOT NULL,
  `ImageUrl` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `IX_ProductImages_ProductId` (`ProductId`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `productimages`
--

INSERT INTO `productimages` (`Id`, `ProductId`, `ImageUrl`) VALUES
(1, 3, '/uploads/products/b5351639-bb76-466a-aebe-259d54cc9670_apple-ipad-air-m4-11-inch-128gb-wifi_1_1.webp'),
(5, 4, '/uploads/products/42cf10a5-bbb4-4488-b63c-85b162c64293_image_1262703564.webp');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
CREATE TABLE IF NOT EXISTS `products` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `CategoryId` int NOT NULL,
  `Name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Description` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `BasePrice` decimal(18,2) NOT NULL,
  `ViewCount` int NOT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  `IsDeleted` tinyint(1) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `IX_Products_CategoryId` (`CategoryId`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`Id`, `CategoryId`, `Name`, `Description`, `BasePrice`, `ViewCount`, `CreatedAt`, `IsDeleted`) VALUES
(2, 1, 'iPhone 15 Pro Max', 'Điện thoại Apple mới nhất', 29000000.00, 0, '2026-04-16 15:01:18.324090', 0),
(3, 1, 'iPad Air 11 inch M4 Wifi 256GB 2026', '', 19490000.00, 0, '2026-04-20 13:03:48.307257', 0),
(4, 4, 'Xiaomi 15 5G', '', 18490000.00, 0, '2026-04-25 17:12:42.634891', 0);

-- --------------------------------------------------------

--
-- Table structure for table `productvariants`
--

DROP TABLE IF EXISTS `productvariants`;
CREATE TABLE IF NOT EXISTS `productvariants` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `ProductId` int NOT NULL,
  `Color` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Storage` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Price` decimal(18,2) NOT NULL,
  `StockQuantity` int NOT NULL,
  `ImageUrl` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `IX_ProductVariants_ProductId` (`ProductId`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `productvariants`
--

INSERT INTO `productvariants` (`Id`, `ProductId`, `Color`, `Storage`, `Price`, `StockQuantity`, `ImageUrl`) VALUES
(3, 2, 'Titan Tự Nhiên', '256GB', 29000000.00, 50, '/uploads/products/59f20682-6acd-4cf3-8b16-53ba95eae37d_iphone-15-promax-titan-tu-nhien.webp'),
(4, 2, 'Titan Trắng', '512GB', 35000000.00, 19, '/uploads/products/dc039030-97f0-4445-9b66-4fa99d6699df_iphone-15-promax-titan-trang.jpg'),
(6, 3, 'Trắng vàng', '256GB', 19490000.00, 50, '/uploads/products/b5351639-bb76-466a-aebe-259d54cc9670_apple-ipad-air-m4-11-inch-128gb-wifi_1_1.webp'),
(13, 4, 'Trắng', '12GB/256GB', 18490000.00, 50, '/uploads/products/cfa10713-54a9-4da8-b722-7b4b7fcd0bd1_image_1262703564.webp'),
(14, 4, 'Đen', '12GB/256GB', 18490000.00, 50, '/uploads/products/5c95e2dd-b2ba-4d53-8a84-81354a015d27_dien-thoai-xiaomi-15_25_.webp');

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
CREATE TABLE IF NOT EXISTS `reviews` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `ProductId` int NOT NULL,
  `UserId` int NOT NULL,
  `Content` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Rating` int NOT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `IX_Reviews_ProductId` (`ProductId`),
  KEY `IX_Reviews_UserId` (`UserId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `specifications`
--

DROP TABLE IF EXISTS `specifications`;
CREATE TABLE IF NOT EXISTS `specifications` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `ProductId` int NOT NULL,
  `SpecKey` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `SpecValue` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `IX_Specifications_ProductId` (`ProductId`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `specifications`
--

INSERT INTO `specifications` (`Id`, `ProductId`, `SpecKey`, `SpecValue`) VALUES
(3, 2, 'Chip', 'Apple A17 Pro'),
(5, 4, 'Chip', 'Snapdragon 8 Elite (Tiến trình sản xuất 3nm)');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Username` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `PasswordHash` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Role` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `AuthProvider` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '',
  `Email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`Id`, `Username`, `PasswordHash`, `Role`, `AuthProvider`, `Email`) VALUES
(1, 'admin', '$2a$11$JLIbttB0T2yFUoewcWEGluRBKhQ2ORUQ08/nH8nvupEQMk6RgIG.m', 'Admin', 'Local', NULL),
(2, 'Thang', '$2a$11$eVrWUPa6zdl6PbE.KMvXF.ftET8/7dtLUJR0dt3EdAvFsVtzaYnQK', 'Staff', 'Local', 'truongminhthang10@gmail.com'),
(3, 'Minh Thang', '$2a$11$hjkzBN/xG93AOn68OZTuj.Q2owXjXUz0cyEFXoCUDmm/GIaNVtbX6', 'User', 'Local', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `__efmigrationshistory`
--

DROP TABLE IF EXISTS `__efmigrationshistory`;
CREATE TABLE IF NOT EXISTS `__efmigrationshistory` (
  `MigrationId` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ProductVersion` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`MigrationId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `__efmigrationshistory`
--

INSERT INTO `__efmigrationshistory` (`MigrationId`, `ProductVersion`) VALUES
('20260416133545_InitialCreate', '9.0.15'),
('20260416171323_AddUserTable', '9.0.15'),
('20260416192245_AddOrderIndexes', '9.0.15'),
('20260425155008_AddNewEntities_Cart_Review_Image', '9.0.15'),
('20260426075445_UpdateUserAndOrderRelations', '9.0.15');

--
-- Constraints for dumped tables
--

--
-- Constraints for table `carts`
--
ALTER TABLE `carts`
  ADD CONSTRAINT `FK_Carts_ProductVariants_VariantId` FOREIGN KEY (`VariantId`) REFERENCES `productvariants` (`Id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_Carts_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `users` (`Id`) ON DELETE CASCADE;

--
-- Constraints for table `orderitems`
--
ALTER TABLE `orderitems`
  ADD CONSTRAINT `FK_OrderItems_Orders_OrderId` FOREIGN KEY (`OrderId`) REFERENCES `orders` (`Id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_OrderItems_ProductVariants_VariantId` FOREIGN KEY (`VariantId`) REFERENCES `productvariants` (`Id`) ON DELETE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `FK_Orders_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `users` (`Id`);

--
-- Constraints for table `productimages`
--
ALTER TABLE `productimages`
  ADD CONSTRAINT `FK_ProductImages_Products_ProductId` FOREIGN KEY (`ProductId`) REFERENCES `products` (`Id`) ON DELETE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `FK_Products_Categories_CategoryId` FOREIGN KEY (`CategoryId`) REFERENCES `categories` (`Id`) ON DELETE CASCADE;

--
-- Constraints for table `productvariants`
--
ALTER TABLE `productvariants`
  ADD CONSTRAINT `FK_ProductVariants_Products_ProductId` FOREIGN KEY (`ProductId`) REFERENCES `products` (`Id`) ON DELETE CASCADE;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `FK_Reviews_Products_ProductId` FOREIGN KEY (`ProductId`) REFERENCES `products` (`Id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_Reviews_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `users` (`Id`) ON DELETE CASCADE;

--
-- Constraints for table `specifications`
--
ALTER TABLE `specifications`
  ADD CONSTRAINT `FK_Specifications_Products_ProductId` FOREIGN KEY (`ProductId`) REFERENCES `products` (`Id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
