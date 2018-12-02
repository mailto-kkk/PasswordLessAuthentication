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

Functional Details
******************
As it is a passwordLess system, we are not capturing password. 
Instead, system will generate one time signature. This signature along with 'login' and 'userReference' will be used to authenticate

1. <Base URL>/v1/User
	- It will create a new user.We are maintaining uniqness based on 'login' field. 
	- After user creation, it will send email with 'userReference' to the user.
	
2. <Base URL>/v1/User/<userReference>/verify
	- Generate One time signature and send the signature to user's 'login' field.
	- If the 'userReference' is wrong, it will throw 404 error.
	
2. <Base URL>/v1/User/<userReference>/login
	- Based on  One time signature and 'login' field, system will authenticate
	- After the successful authentication, system will invalidate the signature generated at the previous end point
