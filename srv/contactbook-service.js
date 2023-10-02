const cds = require('@sap/cds');
const axios = require('axios');
const sapcfaxios = require('sap-cf-axios').default;
const destinationaxios = sapcfaxios("ES5");

module.exports = cds.service.impl(async function () {

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


	this.on('UPDATE', 'Contacts', async (req, next) => {

	})

	//using external service
	this.on('READ', 'Contacts', async (req, next) => {
		//do a read on the contacts service
		/*	let oSanitisedReq = reqSanitiser(req);
			let extContactsResults = await contactsService.run(oSanitisedReq);
			let localContactsResults = await SELECT.from(Contacts);
	
			if (localContactsResults.length == 0){
				//first read
				await srv.create(Contacts).entries(extContactsResults).then(() => {
					return next();
				})
			} else {
				return next();
			} */

		
		let externalRes = await contactsService.send({
			method: 'GET',
			path: '/sap/opu/odata/iwbep/GWSAMPLE_BASIC/ContactSet',
			headers: {
				"content-type": "application/json",
				'X-CSRF-Token': "fetch"
			}
		});

		let localRes = await SELECT.from(Contacts);

		let externalData;

		if (externalRes.length > 0){
			externalData = externalRes.filter((x) => {
				return !(/\d/.test(x.LastName));
			})
		}

		//check to see if we have any new records in this list
		if (localRes.length == 0) {
			//get the address data in the externalData and flatten it
			externalData = externalData.map((x) => {
				let oNewObj = {};
				oNewObj.ID = x.ContactGuid;
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

			console.log(externalData);
			await srv.create(Contacts).entries(externalData).then(() => {
				return next();
			})
		} else {
			return next();
		}
	});
});