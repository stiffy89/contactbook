using contactbookservice as service from '../../srv/contactbook-service';

annotate service.Contacts with @(
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Value : FirstName,
            Label : 'FirstName',
        },
        {
            $Type : 'UI.DataField',
            Value : LastName,
            Label : 'LastName',
        },
        {
            $Type : 'UI.DataField',
            Value : EmailAddress,
            Label : 'EmailAddress',
        },
    ]
);
annotate service.Contacts with @(
    UI.HeaderInfo : {
        Title : {
            $Type : 'UI.DataField',
            Value : FirstName,
        },
        TypeName : '',
        TypeNamePlural : '',
        Description : {
            $Type : 'UI.DataField',
            Value : LastName,
        },
    }
);
annotate service.Contacts with @(
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Personal Information',
            ID : 'PersonalInformation',
            Target : '@UI.FieldGroup#PersonalInformation',
        },
    ],
    UI.FieldGroup #PersonalInformation : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : Sex,
                Label : 'Gender',
            },{
                $Type : 'UI.DataField',
                Value : EmailAddress,
                Label : 'Email',
            },{
                $Type : 'UI.DataField',
                Value : PhoneNumber,
                Label : 'Contact Number',
            },],
    }
);
annotate service.Contacts with @(
    UI.FieldGroup #AddressInformation : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : AddressType,
                Label : 'Address Type',
            },{
                $Type : 'UI.DataField',
                Value : Building,
                Label : 'Building',
            },{
                $Type : 'UI.DataField',
                Value : City,
                Label : 'City',
            },{
                $Type : 'UI.DataField',
                Value : Country,
                Label : 'Country',
            },{
                $Type : 'UI.DataField',
                Value : PostalCode,
                Label : 'Post Code',
            },{
                $Type : 'UI.DataField',
                Value : Street,
                Label : 'Street',
            },],
    }
);
