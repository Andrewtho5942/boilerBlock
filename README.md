This project was made for the BoilerMake XI hackathon at Purdue. It is a browser extension that enables the user to enter a list of websites that will block all outgoing redirects 
(except sites that are on the whitelist). The extension uses chrome's webrequest API to listen for URL get requests and to block them if necessary. The list and settings data is stored in the browser's
local storage to persist between sessions.
