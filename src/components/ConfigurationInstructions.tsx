import React from "react";
import Collapsible from "react-collapsible";
import {Box, Text} from "@airtable/blocks/ui";
import {CollapsibleSectionHeader} from "./CollapsibleSectionHeader";


export const ConfigurationInstructions = () =>
    <Collapsible
        trigger={CollapsibleSectionHeader(false, 'Required Minimum Schema')}
        triggerWhenOpen={CollapsibleSectionHeader(true, 'Required Minimum Schema')}
    >
        <Box border='default' margin='1rem' padding='1rem'>
            <br/>
            This extension requires your base to have a certain minimum schema to work properly. This schema may be
            pre-existing, or you can have this extension create it for you. <br/>
            <br/>
            <div>
                You must have at least 3 tables:
                <ol>
                    <li><Text display='inline' fontWeight={600}>Inventory Table</Text> - Contains your inventory of
                        items
                        that will be checked in/out.
                    </li>
                    <br/>
                    <li><Text display='inline' fontWeight={600}>User Table</Text> - Contains the users that items will
                        be
                        checked out to.
                    </li>
                    <br/>
                    <li>
                        <Text display='inline' fontWeight={600}>Checkouts Table</Text> - Contains links to the above two
                        tables and is where checkouts and
                        checkins are tracked.
                        This extension creates, updates, and optionally deletes records in this table. <br/><br/>

                        <div style={{paddingLeft: '2rem'}}>
                            This table must have the
                            following fields:
                            <ul>
                                <li>A linked record field to the inventory table</li>
                                <li>A linked record field to the user table.</li>
                                <li>A checkbox field indicating the status of a checkout (checked out or checked in)
                                </li>
                            </ul>
                            <br/>
                            This extension can also be configured to work with a few optional fields as well:
                            <ul>
                                <li>A {'Date Checked Out'} field to indicate when a checkout record was created.</li>
                                <li>A {'Date Due'} field to track when outstanding checked out items are due.</li>
                                <li>A {'Date Checked In'} field to track when items are checked in.</li>
                                <li>A {'Cart Id'} field to indicate what other checkouts were in the same cart</li>
                            </ul>
                        </div>

                    </li>
                </ol>
            </div>
        </Box>
    </Collapsible>
;