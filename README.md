# PasswordLessAuthentication

1. To get the PasswordLessAuthenticationAPI project to your machine, Git clone
2. To download npm modules, run command "npm install" from the src directory of PasswordLessAuthentication

2a. Do the neccessary configurations inside the file 'config.json' under folder config, like
    port, dbConfig and loggerConfig.
	
3. Run 'npm start' to start server
4. Access through http://localhost:8883

Pre-requisites
*************
1. As this API is sending emails, we need SMTP server details
2. Install MYSQL server

Configuration Change 
******************
1. DB configuration is done in config\config.json
2. Application start up port is configured in config\config.json
3. Basic Authentication is configured in config\SettingsConfig.json
