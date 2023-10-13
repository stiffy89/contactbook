const cds = require('@sap/cds');


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

	async function readContactsDestination (sUrl) {
		return await contactsService.send({
			method: 'GET',
			path: sUrl
		});
	}

	this.on('DELETE', 'Contacts', async (req, next) => {
		let data = req.data;
		let sPath = "/sap/opu/odata/iwbep/GWSAMPLE_BASIC/ContactSet(guid'" + data.ID + "')"; 

		let externalRes = await contactsService.send({
			method: 'DELETE',
			path: sPath
		});

		return next();
	});

	this.before('EDIT', 'Contacts', async(data) => {
		const results = await SELECT.from(Contacts);
		console.log(results);
	});

	this.after('EDIT', 'Contacts', async(data) => {
		//check to see if we have the existing record in persistence, if not, create it
		const existingRecord = await SELECT.from(Contacts).where({ContactGuid : data.ContactGuid});
		if (existingRecord.length == 0){
			let aFilteredItems = [
			"IsActiveEntity",
			"SiblingEntity",
			"DraftAdministrativeData_DraftUUID",
			"DraftAdministrativeData",
			"HasDraftEntity",
			"HasActiveEntity",
			"uuid"];
	
			let aKeys = Object.keys(data);
			let oNewObj = {};
			for (var i in aKeys){
				if (!aFilteredItems.includes(aKeys[i])){
					oNewObj[aKeys[i]] = data[aKeys[i]]
				}
			}
	
			await srv.create(Contacts).entries(oNewObj);
		}
	})


	this.on('UPDATE', 'Contacts', async (req, next) => {
		
		//remap the data coming through to its original format
		let data = req.data;

		let oOriginalDataObj = {
			ContactGuid : data.ContactGuid,
			Sex : data.Sex,
			FirstName : data.FirstName,
			LastName : data.LastName,
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
		
		let sPath = "/sap/opu/odata/iwbep/GWSAMPLE_BASIC/ContactSet(guid'" + data.ContactGuid + "')"; 

		let externalRes = await contactsService.send({
			method: 'PUT',
			path: sPath,
			data: oOriginalDataObj
		});

		return next();
	});

	this.after('UPDATE', 'Contacts', async(data) => {
		const existingRecord = await SELECT.from(Contacts).where({ContactGuid : data.ContactGuid});
		if (existingRecord.length > 0){
			await DELETE.from(Contacts).where({ContactGuid : data.ContactGuid})
		}
	});

	this.after('SAVE', 'Contacts', async()=> {
		const results = await SELECT.from(Contacts);
		console.log(results);
	});

	this.on('READ', 'Contacts.drafts', async(req, next) => {
		let draftResults = await SELECT.from(Contacts.drafts);
		let draftAdminResults = await SELECT.from('DRAFT.DraftAdministrativeData');
		return next();
	});

	//using external service
	this.on('READ', 'Contacts', async (req, next) => {
		//we can actually get the roles of the logged in user here by looking at req.user from the request coming through
		//check to see what the request is and re-map the query

		//const tx = cds.tx();
		//let dbResults = await tx.run(req);
	
		let sBaseUrl = "/sap/opu/odata/iwbep/GWSAMPLE_BASIC/ContactSet";
		let oQuery = req.query.SELECT;
		if (typeof(oQuery.from.ref[0]) == 'string' && !oQuery.where){
			sBaseUrl += "?$inlinecount=allpages";
		}
		else if (typeof(oQuery.from.ref[0]) == 'object' && !oQuery.where){
			sBaseUrl += ("(guid'" + oQuery.from.ref[0].where[2].val + "')");
		}
		else if (typeof(oQuery.from.ref[0]) == 'string' && oQuery.where) {
			sBaseUrl += ("(guid'" + oQuery.where[2].val + "')");
		}


		/* if (typeof(oSelectQuery.from.ref[0]) == 'object' && oSelectQuery.from.ref[0].id == 'contactbookservice.Contacts') {
			let oWhereClause = oSelectQuery.from.ref[0].where;
			if (oWhereClause[0].ref[0] == 'ContactGuid' && oWhereClause[1] == '='){
				sBaseUrl += ("(guid'" + oWhereClause[2].val + "')")
			}
		}
		else if (oSelectQuery.from.ref[0] == 'contactbookservice.Contacts'){
			
		}
		
		let externalRes = await contactsService.send({
			method: 'GET',
			path: sBaseUrl
		}); */

		let externalRes = await readContactsDestination(sBaseUrl);

		//need to check if the result is an array or just one obj
		let bIsArray = Array.isArray(externalRes);
		let externalData;
		if (bIsArray){
			externalData = externalRes.map((x) => {
				console.log(x)
				let oNewObj = {};
				oNewObj.ContactGuid = x.ContactGuid;
				oNewObj.FirstName = x.FirstName;
				oNewObj.LastName = x.LastName;
				oNewObj.Sex = x.Sex;
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
			//externalData.$count = externalData.length;
		} else {
			externalData = {};
			externalData.ContactGuid = externalRes.ContactGuid;
			externalData.FirstName = externalRes.FirstName;
			externalData.LastName = externalRes.LastName;
			externalData.Sex = externalRes.Sex;
			externalData.PhoneNumber = externalRes.PhoneNumber;
			externalData.EmailAddress = externalRes.EmailAddress;
			externalData.City = externalRes.Address.City;
			externalData.PostalCode = externalRes.Address.PostalCode;
			externalData.Street = externalRes.Address.Street;
			externalData.Building = externalRes.Address.Building;
			externalData.Country = externalRes.Address.Country;
			externalData.AddressType = externalRes.Address.AddressType;
		}

		return externalData;

		/* await srv.create(Contacts).entries(externalData).then(() => {
			return next();
		}) */

		//return externalData;

		let localRes = await SELECT.from(Contacts);

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
				
				return next();
			})
		} else {
			return next();
		} 

	});
});