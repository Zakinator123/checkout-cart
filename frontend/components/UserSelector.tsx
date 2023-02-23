import {Box, Button, loadCSSFromString, RecordCard, Tooltip} from "@airtable/blocks/ui";
import React from "react";

loadCSSFromString(`
.user-selector {
    padding: 1rem;
    display: flex;
    flex-direction: row;
    align-items: center;
    background-color: lightgray;
    justify-content: center;
    min-width: 683px;
}

.user-box {
    width: 568px;
}

.user-search-button {
    color: blue;
    margin: 1rem;
}
`);

function UserSelector(props) {

    return (
        <Box className='user-selector' border='default'>
            {props.currentTransactionUser === null
                ? <Box className='user-box'> No user currently selected!</Box>
                : <Box className='user-box'>
                    <RecordCard record={props.currentTransactionUser}/>
                </Box>}
            <Tooltip
                content="Search Users"
                placementX={Tooltip.placements.CENTER}
                placementY={Tooltip.placements.BOTTOM}
                shouldHideTooltipOnClick={true}
            >
                <Button
                    className='user-search-button'
                    aria-label="Search and select a user to associate with the transaction."
                    icon='search'
                    onClick={props.selectUser}
                />
            </Tooltip>
        </Box>
    );
}

export default UserSelector;