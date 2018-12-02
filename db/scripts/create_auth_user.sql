CREATE TABLE IF NOT EXISTS AUTH_USER_TEST (
   USER_IID int(10) unsigned NOT NULL AUTO_INCREMENT,
   
   LOGIN varchar(255) COLLATE utf8_unicode_ci NOT NULL,
   FIRST_NAME varchar(100) COLLATE utf8_unicode_ci NOT NULL,
   LAST_NAME varchar(100) COLLATE utf8_unicode_ci NOT NULL,
   
   REFERENCE_UUID varchar(36) NOT NULL,
   
   CREATED_TIME_UTC timestamp(4) NOT NULL ,
   PRIMARY KEY (USER_IID),
    COUNTRY varchar(50) COLLATE utf8_unicode_ci NOT NULL,
	STATE varchar(50) COLLATE utf8_unicode_ci NOT NULL,
	CITY varchar(50) COLLATE utf8_unicode_ci NOT NULL,
	POSTAL_CODE varchar(10) COLLATE utf8_unicode_ci NOT NULL,
	STATUS varchar(10) COLLATE utf8_unicode_ci NOT NULL,
	ROLE varchar(30) COLLATE utf8_unicode_ci NOT NULL,
	LOGIN_SIGNATURE varchar(255) COLLATE utf8_unicode_ci,

   INDEX IDX_AUTH_USER_FIRSTNAME (FIRST_NAME ASC),
   INDEX IDX_AUTH_USER_LASTNAME (LAST_NAME ASC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;