# Connected USB Devices
"`r`n`t`t`t`tConnected USB Devices"
Get-WMIObject Win32_USBControllerDevice -Property * -ComputerName $PC |
Foreach-Object {[WMI]($_.Dependent)} |
 Sort Manufacturer, Description |
 FT -GroupBy Manufacturer Name, Description, Service -A