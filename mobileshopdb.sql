-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Apr 20, 2026 at 04:52 PM
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
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
CREATE TABLE IF NOT EXISTS `categories` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Description` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `IsDeleted` tinyint(1) NOT NULL,
  `LogoUrl` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`Id`, `Name`, `Description`, `IsDeleted`, `LogoUrl`) VALUES
(1, 'Apple', 'Các sản phẩm điện thoại iPhone', 0, '/uploads/categories/55574041-4d04-493c-a050-01402fa952d1_apple-logo-vector.webp'),
(2, 'Samsung', 'Các sản phẩm của Samsung', 1, NULL),
(3, 'SamSung', 'Công ty dẫn đầu toàn cầu về công nghệ, điện tử tiêu dùng và viễn thông di động', 0, '/uploads/categories/8435bad6-c3a2-4771-9ea4-a5e24e191425_samsung-logo-on-transparent-background-free-vector.jpg');

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
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `orderitems`
--

INSERT INTO `orderitems` (`Id`, `OrderId`, `VariantId`, `Quantity`, `UnitPrice`) VALUES
(1, 1, 3, 1, 29000000.00);

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
  PRIMARY KEY (`Id`),
  KEY `IX_Orders_CreatedAt` (`CreatedAt`),
  KEY `IX_Orders_Status` (`Status`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`Id`, `CustomerName`, `PhoneNumber`, `Address`, `Email`, `PaymentMethod`, `ShippingMethod`, `TotalAmount`, `Status`, `CreatedAt`) VALUES
(1, 'Nguyễn Văn Khách', '0901234567', '123 Đường ABC, Quận 1', NULL, 'MoMo', 'Delivery', 29000000.00, 0, '2026-04-16 22:53:23.000000');

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
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`Id`, `CategoryId`, `Name`, `Description`, `BasePrice`, `ViewCount`, `CreatedAt`, `IsDeleted`) VALUES
(2, 1, 'iPhone 15 Pro Max', 'Điện thoại Apple mới nhất', 29000000.00, 0, '2026-04-16 15:01:18.324090', 0),
(3, 1, 'iPad Air 11 inch M4 Wifi 256GB 2026', '', 19490000.00, 0, '2026-04-20 13:03:48.307257', 0);

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
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `productvariants`
--

INSERT INTO `productvariants` (`Id`, `ProductId`, `Color`, `Storage`, `Price`, `StockQuantity`, `ImageUrl`) VALUES
(3, 2, 'Titan Tự Nhiên', '256GB', 29000000.00, 50, '/uploads/59f20682-6acd-4cf3-8b16-53ba95eae37d_iphone-15-promax-titan-tu-nhien.webp'),
(4, 2, 'Titan Trắng', '512GB', 35000000.00, 20, '/uploads/dc039030-97f0-4445-9b66-4fa99d6699df_iphone-15-promax-titan-trang.jpg'),
(5, 3, 'Trắng vàng', '256GB', 19490000.00, 50, '/uploads/products/b5351639-bb76-466a-aebe-259d54cc9670_apple-ipad-air-m4-11-inch-128gb-wifi_1_1.webp');

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
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `specifications`
--

INSERT INTO `specifications` (`Id`, `ProductId`, `SpecKey`, `SpecValue`) VALUES
(1, 1, 'Chip', 'Apple A17 Pro'),
(2, 1, 'Màn hình', 'OLED 6.7 inch'),
(3, 2, 'Chip', 'Apple A17 Pro');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Username` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `PasswordHash` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Role` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`Id`, `Username`, `PasswordHash`, `Role`) VALUES
(1, 'admin', '$2a$11$JLIbttB0T2yFUoewcWEGluRBKhQ2ORUQ08/nH8nvupEQMk6RgIG.m', 'Admin');

-- --------------------------------------------------------

--
-- Table structure for table `__efmigrationshistory`
--

DROP TABLE IF EXISTS `__efmigrationshistory`;
CREATE TABLE IF NOT EXISTS `__efmigrationshistory` (
  `MigrationId` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ProductVersion` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`MigrationId`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `__efmigrationshistory`
--

INSERT INTO `__efmigrationshistory` (`MigrationId`, `ProductVersion`) VALUES
('20260416133545_InitialCreate', '9.0.15'),
('20260416171323_AddUserTable', '9.0.15'),
('20260416192245_AddOrderIndexes', '9.0.15');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
