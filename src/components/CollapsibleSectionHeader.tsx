import {Box, Icon, Text} from "@airtable/blocks/ui";
import React from "react";

export const CollapsibleSectionHeader = (isOpen: boolean, headerText: string) => {
    return <Box borderRadius='5px'
                backgroundColor='teal'
                border='default'
                padding='10px'
                display='flex'
                justifyContent='space-between'>
        <Text textColor='white'
              as='h2'
              fontWeight={500}
              size='large'>
            {headerText} (Click to {isOpen ? 'Collapse' : 'Expand'})
        </Text>
        <Box marginLeft='1rem'>
            <Icon name={isOpen ? "chevronUp" : "chevronDown"} size={16}/>
        </Box>
    </Box>
}