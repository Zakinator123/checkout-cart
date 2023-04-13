import React from "react";
import {Box, Button, Loader, Text} from "@airtable/blocks/ui";
import {Toast} from "./Toast";

export const ConfigurationInstructions = ({
                                              openSchemaGenerationDialog,
                                              schemaGenerationToastId,
                                              configurationUpdatePending
                                          }:
                                              {
                                                  openSchemaGenerationDialog: () => void,
                                                  schemaGenerationToastId: { containerId: string },
                                                  configurationUpdatePending: boolean
                                              }) =>
    <Box border='default' margin='0.5rem 1rem 0 1rem' padding='1rem'>
        <div>
            You must have at least 3 tables:
            <ol>
                <li><Text display='inline' fontWeight={600}>Inventory Table</Text> - Contains your inventory of
                    items
                    that will be checked in/out.
                </li>
                <br/>
                <li><Text display='inline' fontWeight={600}>Recipient Table</Text> - Contains the recipients that items
                    will
                    be
                    checked out to.
                </li>
                <br/>
                <li>
                    <Text display='inline' fontWeight={600}>Checkouts Table (Junction Table)</Text> - Contains links to
                    the above two
                    tables and is where checkouts and
                    checkins are tracked.
                    This extension creates, updates, and optionally deletes records in this table.
                    <br/><br/>
                    The primary field can be any type (autonumber is recommended), but if it is a number field,
                    this extension will populate it with a random number for
                    any newly created checkouts. <br/><br/>

                    <div>
                        This table must have the
                        following fields:
                        <ul>
                            <li>A linked record field to the inventory table</li>
                            <li>A linked record field to the recipient table.</li>
                            <li>A checkbox field indicating the status of a checkout (a checked checkbox means that the
                                item is checked in)
                            </li>
                        </ul>
                        <br/>
                        This extension can also be configured to work with a few optional fields as well:
                        <ul>
                            <li>A Date Checked Out field to indicate when a checkout record was created.</li>
                            <li>A Date Due field to track when open checkouts are due.</li>
                            <li>A Date Checked In field to track when items are checked in.</li>
                            <li>A Cart Id field to indicate what other checkouts were in the same cart</li>
                        </ul>
                    </div>
                </li>
            </ol>
        </div>
        <Box marginTop={4} display='flex' flexDirection='column' justifyContent='center' alignItems='center'>
            <Text margin='0 3rem 2rem 3rem'>If you would like the extension to generate these tables and fields for you,
                click &quot;Auto-Generate Required Schema&quot;.</Text>
            <Button variant='danger' onClick={openSchemaGenerationDialog}>
                {configurationUpdatePending
                    ? <Loader scale={0.2} fillColor='white'/>
                    : <Text textColor='white'>Auto-Generate Required Schema</Text>
                }
            </Button>
            <Toast {...schemaGenerationToastId}/>
        </Box>
    </Box>
;