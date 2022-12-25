import {initializeBlock} from '@airtable/blocks/ui';
import React from 'react';
import ActionSelector from "./ActionSelector";

function HelloWorldTypescriptApp() {
    // YOUR CODE GOES HERE
    return (
        <div>
            Hello Test world 🚀
            
            <ActionSelector/>
        </div>
    );
}

initializeBlock(() => <HelloWorldTypescriptApp />);
