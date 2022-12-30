import { initializeBlock, Box } from '@airtable/blocks/ui';
import React from 'react';
import ActionSelector from "./ActionSelector";

function CheckoutWithCart() {
    return (
        <div>
            <Box
                border="default"
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                backgroundColor="white"
                padding="2rem"
                // width={200}
                // height={200}
                overflow="hidden"
            >
                <h1 >🚀 Check Out with Cart 🚀</h1>
                <ActionSelector/>
            </Box>
        </div>
    );
}

initializeBlock(() => <CheckoutWithCart />);
