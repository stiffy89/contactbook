using {contactset as external} from './external/contactset.csn';
using contactbook from '../db/schema';

service contactbookservice {

    entity Contacts @(restrict:[
        {
            grant : ['READ'],
            to : ['viewer']
        },
        {
            grant : ['*'],
            to : ['manager']
        }
    ]){
        key ContactGuid: UUID;
            FirstName: String(40);
            LastName: String(40);
            Sex: String (1);
            PhoneNumber: String(30);
            EmailAddress: String(255);
            City: String(40);
            PostalCode: String(10);
            Street: String(60);
            Building: String(10);
            Country: String(10);
            AddressType: String(2);
    }

    annotate Contacts with @odata.draft.enabled;
}