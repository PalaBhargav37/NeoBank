# NeoBank Backend Startup Script
# Run from the POC root directory: .\start-backend.ps1

Write-Host "Starting NeoBank Backend..." -ForegroundColor Cyan

$baseDir = "$PSScriptRoot\Backend"
$m2 = "C:\Users\pala.TRN\.m2\repository"

# Re-compile if source is newer than classes
Write-Host "Compiling..." -ForegroundColor Yellow
cd $baseDir
C:\Apache-Maven-3.9.11\bin\mvn.cmd -o clean compile -q 2>&1 | Where-Object { $_ -match "ERROR|BUILD" }

# Build targeted classpath (Spring Boot 3.5.11 exact versions)
$allJars = @(
    "$baseDir\target\classes",
    "$m2\org\springframework\boot\spring-boot\3.5.11\spring-boot-3.5.11.jar",
    "$m2\org\springframework\boot\spring-boot-autoconfigure\3.5.11\spring-boot-autoconfigure-3.5.11.jar",
    "$m2\org\springframework\spring-core\6.2.16\spring-core-6.2.16.jar",
    "$m2\org\springframework\spring-beans\6.2.16\spring-beans-6.2.16.jar",
    "$m2\org\springframework\spring-context\6.2.16\spring-context-6.2.16.jar",
    "$m2\org\springframework\spring-aop\6.2.16\spring-aop-6.2.16.jar",
    "$m2\org\springframework\spring-expression\6.2.16\spring-expression-6.2.16.jar",
    "$m2\org\springframework\spring-jcl\6.2.16\spring-jcl-6.2.16.jar",
    "$m2\org\springframework\spring-web\6.2.16\spring-web-6.2.16.jar",
    "$m2\org\springframework\spring-webmvc\6.2.16\spring-webmvc-6.2.16.jar",
    "$m2\org\springframework\spring-jdbc\6.2.16\spring-jdbc-6.2.16.jar",
    "$m2\org\springframework\spring-orm\6.2.16\spring-orm-6.2.16.jar",
    "$m2\org\springframework\spring-tx\6.2.16\spring-tx-6.2.16.jar",
    "$m2\org\springframework\spring-aspects\6.2.16\spring-aspects-6.2.16.jar",
    "$m2\org\springframework\security\spring-security-core\6.5.8\spring-security-core-6.5.8.jar",
    "$m2\org\springframework\security\spring-security-config\6.5.8\spring-security-config-6.5.8.jar",
    "$m2\org\springframework\security\spring-security-web\6.5.8\spring-security-web-6.5.8.jar",
    "$m2\org\springframework\security\spring-security-crypto\6.5.8\spring-security-crypto-6.5.8.jar",
    "$m2\org\springframework\data\spring-data-jpa\3.5.9\spring-data-jpa-3.5.9.jar",
    "$m2\org\springframework\data\spring-data-commons\3.5.9\spring-data-commons-3.5.9.jar",
    "$m2\org\slf4j\slf4j-api\2.0.17\slf4j-api-2.0.17.jar",
    "$m2\org\slf4j\jul-to-slf4j\2.0.17\jul-to-slf4j-2.0.17.jar",
    "$m2\org\apache\logging\log4j\log4j-to-slf4j\2.24.3\log4j-to-slf4j-2.24.3.jar",
    "$m2\org\apache\logging\log4j\log4j-api\2.24.3\log4j-api-2.24.3.jar",
    "$m2\ch\qos\logback\logback-classic\1.5.32\logback-classic-1.5.32.jar",
    "$m2\ch\qos\logback\logback-core\1.5.32\logback-core-1.5.32.jar",
    "$m2\org\hibernate\orm\hibernate-core\6.6.42.Final\hibernate-core-6.6.42.Final.jar",
    "$m2\org\hibernate\common\hibernate-commons-annotations\7.0.3.Final\hibernate-commons-annotations-7.0.3.Final.jar",
    "$m2\org\hibernate\validator\hibernate-validator\8.0.3.Final\hibernate-validator-8.0.3.Final.jar",
    "$m2\org\hibernate\models\hibernate-models\1.0.1\hibernate-models-1.0.1.jar",
    "$m2\org\apache\tomcat\embed\tomcat-embed-core\10.1.52\tomcat-embed-core-10.1.52.jar",
    "$m2\org\apache\tomcat\embed\tomcat-embed-el\10.1.52\tomcat-embed-el-10.1.52.jar",
    "$m2\org\apache\tomcat\embed\tomcat-embed-websocket\10.1.52\tomcat-embed-websocket-10.1.52.jar",
    "$m2\com\fasterxml\jackson\core\jackson-databind\2.19.4\jackson-databind-2.19.4.jar",
    "$m2\com\fasterxml\jackson\core\jackson-core\2.19.4\jackson-core-2.19.4.jar",
    "$m2\com\fasterxml\jackson\core\jackson-annotations\2.19.4\jackson-annotations-2.19.4.jar",
    "$m2\com\fasterxml\jackson\datatype\jackson-datatype-jdk8\2.19.4\jackson-datatype-jdk8-2.19.4.jar",
    "$m2\com\fasterxml\jackson\datatype\jackson-datatype-jsr310\2.19.4\jackson-datatype-jsr310-2.19.4.jar",
    "$m2\com\fasterxml\jackson\module\jackson-module-parameter-names\2.19.4\jackson-module-parameter-names-2.19.4.jar",
    "$m2\com\mysql\mysql-connector-j\9.6.0\mysql-connector-j-9.6.0.jar",
    "$m2\com\zaxxer\HikariCP\6.3.3\HikariCP-6.3.3.jar",
    "$m2\jakarta\persistence\jakarta.persistence-api\3.1.0\jakarta.persistence-api-3.1.0.jar",
    "$m2\jakarta\transaction\jakarta.transaction-api\2.0.1\jakarta.transaction-api-2.0.1.jar",
    "$m2\jakarta\validation\jakarta.validation-api\3.0.2\jakarta.validation-api-3.0.2.jar",
    "$m2\jakarta\annotation\jakarta.annotation-api\2.1.1\jakarta.annotation-api-2.1.1.jar",
    "$m2\jakarta\xml\bind\jakarta.xml.bind-api\4.0.4\jakarta.xml.bind-api-4.0.4.jar",
    "$m2\jakarta\activation\jakarta.activation-api\2.1.4\jakarta.activation-api-2.1.4.jar",
    "$m2\org\glassfish\jaxb\jaxb-core\4.0.6\jaxb-core-4.0.6.jar",
    "$m2\org\glassfish\jaxb\jaxb-runtime\4.0.6\jaxb-runtime-4.0.6.jar",
    "$m2\org\glassfish\jaxb\txw2\4.0.6\txw2-4.0.6.jar",
    "$m2\com\sun\istack\istack-commons-runtime\4.1.2\istack-commons-runtime-4.1.2.jar",
    "$m2\org\eclipse\angus\angus-activation\2.0.3\angus-activation-2.0.3.jar",
    "$m2\io\micrometer\micrometer-observation\1.15.9\micrometer-observation-1.15.9.jar",
    "$m2\io\micrometer\micrometer-commons\1.15.9\micrometer-commons-1.15.9.jar",
    "$m2\io\micrometer\micrometer-core\1.16.3\micrometer-core-1.16.3.jar",
    "$m2\io\micrometer\micrometer-jakarta9\1.16.3\micrometer-jakarta9-1.16.3.jar",
    "$m2\io\smallrye\jandex\3.2.0\jandex-3.2.0.jar",
    "$m2\org\jboss\logging\jboss-logging\3.6.2.Final\jboss-logging-3.6.2.Final.jar",
    "$m2\com\fasterxml\classmate\1.7.3\classmate-1.7.3.jar",
    "$m2\net\bytebuddy\byte-buddy\1.17.8\byte-buddy-1.17.8.jar",
    "$m2\net\bytebuddy\byte-buddy-agent\1.17.8\byte-buddy-agent-1.17.8.jar",
    "$m2\org\aspectj\aspectjweaver\1.9.25.1\aspectjweaver-1.9.25.1.jar",
    "$m2\org\yaml\snakeyaml\2.4\snakeyaml-2.4.jar",
    "$m2\commons-codec\commons-codec\1.19.0\commons-codec-1.19.0.jar",
    "$m2\commons-logging\commons-logging\1.3.5\commons-logging-1.3.5.jar",
    "$m2\io\jsonwebtoken\jjwt-api\0.11.5\jjwt-api-0.11.5.jar",
    "$m2\io\jsonwebtoken\jjwt-impl\0.11.5\jjwt-impl-0.11.5.jar",
    "$m2\io\jsonwebtoken\jjwt-jackson\0.11.5\jjwt-jackson-0.11.5.jar",
    "$m2\org\antlr\antlr4-runtime\4.13.2\antlr4-runtime-4.13.2.jar"
)

$cp = $allJars -join ";"
$argContent = "-cp`n$cp"
[System.IO.File]::WriteAllText("$baseDir\target\jvm-args.txt", $argContent, [System.Text.Encoding]::ASCII)

Write-Host "Launching backend on http://localhost:8080 ..." -ForegroundColor Green
java "@$baseDir\target\jvm-args.txt" com.neobank.BackendApplication
