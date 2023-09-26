using {contactset as external} from './external/contactset.csn';
using contactbook from '../db/schema';

service contactbookservice {

    entity Contacts {
        key ID: UUID;
            FirstName: String(40);
            LastName: String(40);
            Gender: String (1);
            PhoneNumber: String(30);
            EmailAddress: String(255);
            City: String(40);
            PostalCode: String(10);
            Street: String(60);
            Building: String(10);
            Country: String(10);
            AddressType: String(2);
    }
}