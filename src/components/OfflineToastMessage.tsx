import {Box, Text} from "@airtable/blocks/ui";
import React from "react";

export const OfflineToastMessage = () => <Box padding={2}><Text textColor='white'>
    Airtable is taking a while to respond. Please check your network connection.
    <br/><br/>
    You may need to refresh the browser and retry the attempted action.
</Text></Box>;