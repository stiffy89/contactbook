sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'contactbook/test/integration/FirstJourney',
		'contactbook/test/integration/pages/ContactsList',
		'contactbook/test/integration/pages/ContactsObjectPage'
    ],
    function(JourneyRunner, opaJourney, ContactsList, ContactsObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('contactbook') + '/index.html'
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