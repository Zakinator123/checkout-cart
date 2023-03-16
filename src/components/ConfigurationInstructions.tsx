import React from "react";

export const ConfigurationInstructions = () =>
    <div>
        This extension requires your base to have a certain minimum schema to work properly. This schema may be
        pre-existing, or you can have this extension create it for you. <br/>

        <h4>Required Minimum Schema</h4>

        You must have at least 3 tables:
        <ol>
            <li>Inventory Table - Contains your inventory of items that will be checked in/out.</li>
            <br/>
            <li>User Table - Contains the users that will be checking out the items.</li>
            <br/>
            <li>
                Checkouts Table - Contains links to the above two tables and is where checkouts and
                checkins are tracked.
                This extension primarily manipulates records in this table. <br/><br/>

                <div style={{paddingLeft: '2rem'}}>
                    This table must have the
                    following fields:
                    <ul>
                        <li>A linked record field to the inventory table</li>
                        <li>A linked record field to the user table.</li>
                        <li>A checkbox field indicating the status of a checkout (checked out or checked in)</li>
                    </ul>
                    <br/>
                    This extension can also be configured to work with a few optional fields as well:
                    <ul>
                        <li>A {'Date Checked Out'} field to indicate when a checkout record was created.</li>
                        <li>A {'Date Due'} field to track when outstanding checked out items are due.</li>
                        <li>A {'Date Checked In'} field to track when items are checked in.</li>
                    </ul>
                </div>

            </li>
        </ol>
    </div>
;