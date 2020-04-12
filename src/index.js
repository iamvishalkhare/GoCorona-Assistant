// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';
 
const axios = require('axios');
var moment = require('moment');
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
 
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
 
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
 
  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }
 
  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }
  
  function country(agent) {
    let country = agent.parameters['geo-country'];
    return axios.get(`https://corona.lmao.ninja/v2/countries/${country}?yesterday=true&strict=true`)
    .then(response => {
      if (JSON.stringify(response.data.country) === null || JSON.stringify(response.data.country) === undefined) {
        agent.add(`Sorry..!!!  I didn't get that. I can show you Corona cases statistics for all countries and Indian states but are you sure you typed the name of the location correctly?`);
      } else {
      let recieved_country = JSON.stringify(response.data.country);
      let total_cases = JSON.stringify(response.data.cases);
      let today_cases = JSON.stringify(response.data.todayCases);
      let death_cases = JSON.stringify(response.data.deaths);
      let today_deaths = JSON.stringify(response.data.todayDeaths);
      let recovered_cases = JSON.stringify(response.data.recovered);
      let active_cases = JSON.stringify(response.data.active);
      let critical_cases = JSON.stringify(response.data.critical);
      let cases_per_million = JSON.stringify(response.data.casesPerOneMillion);
      let deaths_per_million = JSON.stringify(response.data.deathsPerOneMillion);
      let total_tests = JSON.stringify(response.data.tests);
      let tests_per_million = JSON.stringify(response.data.testsPerOneMillion);
      let updated_time = moment(response.data.updated).format('Do MMM YYYY HH:mm') + ' ';
      let message = `Covid-19 cases in *${recieved_country}* last updated on *${updated_time} Hrs* \n
Total cases - *${total_cases}*
Deceased - *${death_cases}*
Recovered - *${recovered_cases}*
Active - *${active_cases}*
Critical - *${critical_cases}*
------------------------------------------------------
Cases per million - *${cases_per_million}*
Deaths per million - *${deaths_per_million}*
------------------------------------------------------
Total tests performed - *${total_tests}*
Tests per million performed - *${tests_per_million}*
------------------------------------------------------`;
      agent.add(message);
      }
    }).catch(error => {
      	console.log('Error is ' + error);
      	agent.add(`Sorry..!!! Either something went wrong or I coudln't understand what you said. You can try rephrasing your sentence or contact my creator. *Vishal Khare* (vishalkhare39@gmail.com)`);
    });
  }
  
  
  function states(agent) {
    let state_name = agent.parameters['indian_states'];
    if (state_name === undefined || state_name === null) {
    	agent.add(`Sorry..!!!  I didn't get that. I can show you Corona cases statistics for all countries and Indian states but are you sure you typed the name of the location correctly?`);
    } else {
    	return axios.get(`https://api.rootnet.in/covid19-in/unofficial/covid19india.org/statewise`)
      	.then(response => {
          let choosen_doc = response.data.data.statewise.filter(function(ele) {
          	return ele.state.trim() === state_name.trim();
          });
          let last_updated = moment(response.data.data.lastRefreshed).format('Do MMM YYYY HH:mm') + ' ';
          let choosen_state_name = choosen_doc[0].state;
          let confirmed_cases = choosen_doc[0].confirmed;
          let death_cases = choosen_doc[0].deaths;
          let recovered_cases = choosen_doc[0].recovered;
          let active_cases = choosen_doc[0].active;
          let message = `Covid-19 cases in *${choosen_state_name}* as last updated on *${last_updated} Hrs*

Confirmed cases - *${confirmed_cases}*
Deceased - *${death_cases}*
Recovered - *${recovered_cases}*
Active - *${active_cases}*`;
          agent.add(message);
        }).catch(error => {
        	console.log('Error is ' + error);
      		agent.add(`Sorry..!!! Either something went wrong or I coudln't understand what you said. You can try rephrasing your sentence or contact my creator. *Vishal Khare* (vishalkhare39@gmail.com)`);
        });
    }
  }
  
  
  function helpline(agent) {
  	let state_name = agent.parameters['indian_states'];
    if (state_name === undefined || state_name === null) {
    	agent.add(`Sorry..!!!  I didn't get that. I can show you Corona cases statistics for all countries and Indian states but are you sure you typed the name of the location correctly?`);
    } else {
    	return axios.get(`https://api.rootnet.in/covid19-in/contacts`)
      	.then(response => {
        	let choosen_doc = response.data.data.contacts.regional.filter(function(ele) {
          		return ele.loc.trim() === state_name.trim();
          	});
          	let choosen_state = choosen_doc[0].loc;
          	let phone_number = choosen_doc[0].number;
          let message = `Covid-19 emergency contact number for *${choosen_state}* is *${phone_number}*`;
          agent.add(message);
        }).catch(error => {
        	console.log('Error is ' + error);
      		agent.add(`Sorry..!!! Either something went wrong or I coudln't understand what you said. You can try rephrasing your sentence or contact my creator. *Vishal Khare* (vishalkhare39@gmail.com)`);
        });
    }
  }
  
  
  function hospitalNumberIndia(agent) {
  	return axios.get(`https://api.rootnet.in/covid19-in/hospitals/beds`)
    .then(response => {
      let ruralHospitals = response.data.data.summary.ruralHospitals;
      let ruralBeds = response.data.data.summary.ruralBeds;
      let urbanHospitals = response.data.data.summary.urbanHospitals;
      let urbanBeds = response.data.data.summary.urbanBeds;
      let totalHospitals = response.data.data.summary.totalHospitals;
      let totalBeds = response.data.data.summary.totalBeds;
      let lastUpdated = moment(response.data.data.sources.lastUpdated).format('Do MMM YYYY HH:mm') + ' ';
      
      let message = `Number of hospitals in *India* last updated on *${lastUpdated} Hrs*

Rural Hospitals - *${ruralHospitals}*
Rural Beds - *${ruralBeds}*
------------------------------------------------------
Urban Hospitals - *${urbanHospitals}*
Urban Beds - *${urbanBeds}*
------------------------------------------------------
Total Hospitals   -  *${totalHospitals}*
Total Beds   -   *${totalBeds}*
------------------------------------------------------

Want to know hospitals and beds numbers for any Indian state?
Try saying something like *"How many hospitals are there in Haryana?"*

*NOTE* - I have this information only for India and Indian states.
`;
      agent.add(message);
    }).catch(error => {
    	console.log('Error is ' + error);
      	agent.add(`Sorry..!!! Either something went wrong or I coudln't understand what you said. You can try rephrasing your sentence or contact my creator. *Vishal Khare* (vishalkhare39@gmail.com)`);
    });
  }
  
  
  function hospitalNumberIndianStates(agent) {
    let state_name = agent.parameters['indian_states'];
  	 if (state_name === undefined || state_name === null) {
    	agent.add(`Sorry..!!!  I didn't get that. I can show you Corona cases statistics for all countries and Indian states but are you sure you typed the name of the location correctly?`);
    } else {
      if (state_name.includes(`and`) && state_name.split(` `).length > 1) {
      	state_name = state_name.replace(`and`, `&`);
      }
      return axios.get(`https://api.rootnet.in/covid19-in/hospitals/beds`)
      .then(response => {
        let choosen_doc = response.data.data.regional.filter(function(ele) {
          	return ele.state.trim() === state_name.trim();
        });
        
        let ruralHospitals = choosen_doc[0].ruralHospitals;
        let ruralBeds = choosen_doc[0].ruralBeds;
        let urbanHospitals = choosen_doc[0].urbanHospitals;
        let urbanBeds = choosen_doc[0].urbanBeds;
        let totalHospitals = choosen_doc[0].totalHospitals;
        let totalBeds = choosen_doc[0].totalBeds;
        let state_choosen = choosen_doc[0].state;
        let lastUpdated = moment(response.data.data.sources.lastUpdated).format('Do MMM YYYY HH:mm') + ' ';
        
        let message = `Number of hospitals in *${state_choosen}* last updated on *${lastUpdated} Hrs*

Rural Hospitals - *${ruralHospitals}*
Rural Beds - *${ruralBeds}*
------------------------------------------------------
Urban Hospitals - *${urbanHospitals}*
Urban Beds - *${urbanBeds}*
------------------------------------------------------
Total Hospitals   -  *${totalHospitals}*
Total Beds   -   *${totalBeds}*
------------------------------------------------------

*NOTE* - I have this information only for India and Indian states.
`;
        agent.add(message);
      }).catch(error => {
      	console.log('Error is ' + error);
      	agent.add(`Sorry..!!! Either something went wrong or I coudln't understand what you said. You can try rephrasing your sentence or contact my creator. *Vishal Khare* (vishalkhare39@gmail.com)`);
      });
    	
    }
  }
  
  
/**  function listOfHospitalsInindianStates(agent) {
  	 let state_name = agent.parameters['indian_states'];
  	 if (state_name === undefined || state_name === null) {
    	agent.add(`Sorry..!!!  I didn't get that. I can show you Corona cases statistics for all countries and Indian states but are you sure you typed the name of the location correctly?`);
    } else {
      if (state_name.includes(`and`) && state_name.split(` `).length > 1) {
      	state_name = state_name.replace(`and`, `&`);
      }
      return axios.get(`https://api.steinhq.com/v1/storages/5e6e3e9fb88d3d04ae08158c/Hospitals`)
      .then(response => {
        let choosen_doc = response.data.filter(function(ele) {
          return ele['State/UT'].trim() === state_name.trim();
        });
        if (choosen_doc.length < 1) {
          agent.add(`List of Hospitals for ${state_name} NOT FOUND`);
        } else {
        	let medical_college = choosen_doc[0]['State/UT'];
        	let message = `List of Medical colleges in *${medical_college}* as follows
------------------------------------------------------`;
          for (let i = 0; i < choosen_doc.length; i++) {
            let college_name = choosen_doc[i].MedicalCollegeName;
            let college_city = choosen_doc[i]['City/Town'];
            let college_ownership = choosen_doc[i]['Govt/Private'];
            let college_admission_capacity = choosen_doc[i].AdmissionCapacity;
            let college_beds = choosen_doc[i].BedsInAttachedHospital;
            let index_number = i + 1;
          	let college_message = `*${index_number}*.
Name - *${college_name}*
City - *${college_city}*
Ownership - *${college_ownership}*
Admission Capacity - *${college_admission_capacity}*
Hospital Beds - *${college_beds}*
------------------------------------------------------`;
            message+=college_message;
          }
          agent.add(message);
        }
      }).catch(error => {
      	console.log('Error is ' + error);
      	agent.add(`Sorry..!!! Either something went wrong or I coudln't understand what you said. You can try rephrasing your sentence or contact my creator. *Vishal Khare* (vishalkhare39@gmail.com)`);
      });
  }
**/
  
  
  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('country-api', country);
  intentMap.set('indian-states-api', states);
  intentMap.set('indian-state-helpline-api', helpline);
  intentMap.set('hospital-number-india', hospitalNumberIndia);
  intentMap.set('hospital-numbers-indian-state-api', hospitalNumberIndianStates);
  // intentMap.set('list-of-hospital-indian-states-api', listOfHospitalsInindianStates);
  // intentMap.set('your intent name here', yourFunctionHandler);
  // intentMap.set('your intent name here', googleAssistantHandler);
  agent.handleRequest(intentMap);
});
