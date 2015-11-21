--
-- temperature-sensor-reader - http://github.com/blueskyfish/temperature-sensor-reader.git
--
-- The MIT License (MIT)
-- Copyright (c) 2015 BlueSkyFish
--

SET FOREIGN_KEY_CHECKS=0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

--
-- Create Database
--
-- CREATE DATABASE `temo-local` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
--

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `sensor-local`
--

--
-- NOTE: If you change the table name, then you have to change the name in the "storage-provider"!!
--

DROP TABLE IF EXISTS `sensor-reader-local`;
CREATE TABLE IF NOT EXISTS `sensor-reader-local` (
  `sensor_id`   int(11) NOT NULL COMMENT 'the primary key',
  `group_id`    int(11) NOT NULL COMMENT 'the group id of the sensor reader',
  `name_id`     int(11) NOT NULL COMMENT 'the name id of the sensor',
  `temperature` int(11) NOT NULL COMMENT 'The temperature value is multiplied by 100',
  `humidity`    int(11) NOT NULL COMMENT 'The humidity value is multiplied by 100',
  `date`        datetime NOT NULL,
  `status`      enum('SAVED','UPLOADED','DELETED') NOT NULL DEFAULT 'SAVED'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='(temperature-sensor-reader) the reader local sensor data';

--
-- Indizes für die Tabelle `sensor-local`
--
ALTER TABLE `sensor-local`
  ADD PRIMARY KEY (`sensor_id`),
  ADD KEY `SENSOR` (`group_id`,`name_id`);

--
-- AUTO_INCREMENT für exportierte Tabellen
--

--
-- AUTO_INCREMENT für Tabelle `sensor-local`
--
ALTER TABLE `sensor-local`
  MODIFY `sensor_id` int(11) NOT NULL AUTO_INCREMENT;SET FOREIGN_KEY_CHECKS=1;

COMMIT;
