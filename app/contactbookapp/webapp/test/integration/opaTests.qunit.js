sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'ns/contactbookapp/test/integration/FirstJourney',
		'ns/contactbookapp/test/integration/pages/ContactsList',
		'ns/contactbookapp/test/integration/pages/ContactsObjectPage'
    ],
    function(JourneyRunner, opaJourney, ContactsList, ContactsObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('ns/contactbookapp') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheContactsList: ContactsList,
					onTheContactsObjectPage: ContactsObjectPage
                }
            },
            opaJourney.run
        );
    }
);