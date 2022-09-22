# Dockerfile  
    FROM node:16 
#Setting a default value to Argument 
ENV SOC_API_HOSTDB="180.93.175.189"
ENV SOC_API_USERDB="helion"
ENV SOC_API_PASSWORDDB="helion"
ENV SOC_API_CLUSTER="cluster0"
ENV SOC_API_DBNAME="helion"
ENV SOC_API_PORTDB=9000
ENV SOC_API_PORTNODE=3000
 
    WORKDIR /app  
    COPY . /app  
    RUN npm install  
    EXPOSE 	8001  
    CMD node SOC_API.js
