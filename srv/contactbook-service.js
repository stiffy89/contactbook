const cds = require('@sap/cds');
const axios = require('axios');
const sapcfaxios = require('sap-cf-axios').default;
const destinationaxios = sapcfaxios("ES5");
const log = require('cf-nodejs-logging-support');
log.setLoggingLevel('info');
log.registerCustomFields(["readData", "updateData"]);

module.exports = cds.service.impl(async function (req,res,next) {

	const contactsService = await cds.connect.to('contactset');

	let { Contacts } = this.entities;

	let srv = this;

	function reqSanitiser(req) {
		if (req.query.SELECT) {
			if (!req.query.SELECT.columns) {
				req.query.SELECT.columns = [];
				for (const el in req.target.elements) {
					req.query.SELECT.columns.push({ ref: [el] });
				}
			}
		}

		req.query.SELECT.columns = req.query.SELECT.columns.filter((c) =>
			!([
				"IsActiveEntity",
				"SiblingEntity",
				"DraftAdministrativeData_DraftUUID",
				"DraftAdministrativeData",
				"HasDraftEntity",
				"HasActiveEntity",
				"uuid"
			].includes(c.ref?.[0]))
		);

		if (req.query.SELECT.orderBy) {
			req.query.SELECT.orderBy = req.query.SELECT.orderBy.filter((x) => !([
				"uuid"
			]).includes(x.ref?.[0]));
		}

		return req;
	}

	/* async function readContactsDestination () {
	   return axios({
			method: 'GET',
			baseURL: 'http://ES5.dest',
			url: '/sap/opu/odata/iwbep/GWSAMPLE_BASIC/ContactSet',
			headers: {
				"content-type": "application/json",
				'X-CSRF-Token': "fetch"
			}
		});
	} */

	this.on('DELETE', 'Contacts', async (req, next) => {
		let data = req.data;
		let sPath = "/sap/opu/odata/iwbep/GWSAMPLE_BASIC/ContactSet(guid'" + data.ID + "')"; 

		let externalRes = await contactsService.send({
			method: 'DELETE',
			path: sPath
		});

		return next();
	})


	this.on('UPDATE', 'Contacts', async (req, next) => {
		//remap the data coming through to its original format
		log.info('Updating data');
		let data = req.data;

		let oOriginalDataObj = {
			ContactGuid : data.OriginalID,
			Sex : data.Gender,
			FirstName : data.FirstName,
			PhoneNumber : data.PhoneNumber,
			EmailAddress : data.EmailAddress,
			Address: {
				City : data.City,
				PostalCode : data.PostalCode,
				Street : data.Street,
				Building : data.Building,
				Country : data.Country,
				AddressType : data.AddressType
			}
		};
		

		let sPath = "/sap/opu/odata/iwbep/GWSAMPLE_BASIC/ContactSet(guid'" + data.OriginalID + "')"; 

		let externalRes = await contactsService.send({
			method: 'PUT',
			path: sPath,
			data: oOriginalDataObj
		});

		log.info("data updated", {"updateData":oOriginalDataObj});

		return next();

	});

	

	this.on('EDIT', 'Contacts', async(req, next) => {
		return next();
	})

	this.on('NEW', 'Contacts.drafts', async(req, next) => {
		console.log(req);
		return next();
	})

	this.on('READ', 'Contacts.drafts', async(req, next) => {
		let draftResults = await SELECT.from(Contacts.drafts);
		return next();
	});

	//using external service
	this.on('READ', 'Contacts', async (req, next) => {
		//we can actually get the roles of the logged in user here by looking at req.user from the request coming through

		log.info('Reading Data');

		//check to see what the request is and re-map the query
		let oSelectQuery = req.query.SELECT;
		let sBaseUrl = "/sap/opu/odata/iwbep/GWSAMPLE_BASIC/ContactSet";

		if (typeof(oSelectQuery.from.ref[0]) == 'object' && oSelectQuery.from.ref[0].id == 'contactbookservice.Contacts') {
			let oWhereClause = oSelectQuery.from.ref[0].where;
			if (oWhereClause[0].ref[0] == 'ContactGuid' && oWhereClause[1] == '='){
				sBaseUrl += ("(guid'" + oWhereClause[2].val + "')")
			}
		}
		else if (oSelectQuery.from.ref[0] == 'contactbookservice.Contacts'){
			sBaseUrl += "?$inlinecount=allpages";
		}
		else {
			return next();
		}


		
		let externalRes = await contactsService.send({
			method: 'GET',
			path: sBaseUrl
		});

		//return externalRes;

		let localRes = await SELECT.from(Contacts);

		let externalData;

		if (externalRes.length > 0){
			externalData = externalRes.filter((x) => {
				return !(/\d/.test(x.LastName));
			})
		}



		//check to see if we have any new records in this list
		if (localRes.length == 0) {
			
			externalData = externalData.map((x) => {
				let oNewObj = {};
				oNewObj.ContactGuid = x.ContactGuid;
				oNewObj.OriginalID = x.ContactGuid;
				oNewObj.FirstName = x.FirstName;
				oNewObj.LastName = x.LastName;
				oNewObj.Gender = x.Sex;
				oNewObj.PhoneNumber = x.PhoneNumber;
				oNewObj.EmailAddress = x.EmailAddress;
				oNewObj.City = x.Address.City;
				oNewObj.PostalCode = x.Address.PostalCode;
				oNewObj.Street = x.Address.Street;
				oNewObj.Building = x.Address.Building;
				oNewObj.Country = x.Address.Country;
				oNewObj.AddressType = x.Address.AddressType;
				return oNewObj;
			});

			
			await srv.create(Contacts).entries(externalData).then(() => {
				log.info('external data has been read', {'readData':externalData});
				return next();
			})
		} else {
			return next();
		} 

	});
});