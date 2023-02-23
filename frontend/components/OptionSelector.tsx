import React from "react";
import { SelectButtons } from "@airtable/blocks/ui";

const OptionSelector = ({currentOption, options, setOption}) => {
    return (
        <SelectButtons
            value={currentOption}
            onChange={(newValue: string) => setOption(newValue)}
            options={options}
            width="320px"
            margin="2rem"
        />
    );
};
export default OptionSelector;