using {sap} from '@sap/cds/common';
using {contactset as external} from '../srv/external/contactset.csn';

namespace contactbook;

entity Contacts {
    key ContactGuid: UUID;
        FirstName: String(40);
        LastName: String(40);
        Sex: String (1);
        PhoneNumber: String(30);
        EmailAddress: String(255);
}