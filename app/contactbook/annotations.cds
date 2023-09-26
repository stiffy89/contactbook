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
