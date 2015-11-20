
# Sensor Reader

> The Temperature Sensor Reader processes the temperature and humidity receiving from the [ELV USB-WDE1](http://www.elv.de/-353.html) sensor adapter.

## Start

Start the reader application:

```
$ node reader.js [--config=path/to/config.js] [--help] [--level=xxx]
```

## Arguments

The program arguments are optional.

name               | description
-------------------|-----------------------------
 config            | the filename of the configuration. If not present, then it use "config.js"
help               | shows the usage of the application
level              | set the log level


## Config File

The configuration for all parameters is in a js file. If the parameter `config` is not present, then it is looking for the file in the current folder.

property           | description
-------------------|-----------------------------
level.namespaces   | a key / value map (key = namespace, value = log level)
level.separator    | the separator in the namespace.
sensor.groupId     | the sensor group id
database.name      | the database name
database.host      | the host of the database server
database.port      | the port of the database server
database.user      | the user of the database
database.pass      | the password of the database user
server.url         | the url of the rest server (http://domain/path/server/upload)
port.name          | the filename of the serial port
port.baudrate      | the baudrate for reading the sensor raw data
port.separator     | the line separator



## Statement

This application needs the [ELV USB-WDE1 Adapter](http://www.elv.de/-353.html). This is a private hobby project and I have no business relationship with the company [ELV GmbH](http://www.elv.de).


## License

```
The MIT License (MIT)

Copyright (c) 2015 BlueSkyFish

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```