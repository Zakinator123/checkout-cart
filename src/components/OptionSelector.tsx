import {Label, loadCSSFromString, SelectButtons} from "@airtable/blocks/ui";
import React from "react";

loadCSSFromString(`
.option-selector {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
}`);


const OptionSelector = ({currentOption, options, setOption}) => {
    return <div className='option-selector'>
        <div>
            <Label>Select the transaction type:</Label>
            <SelectButtons
                value={currentOption}
                onChange={(newValue: string) => setOption(newValue)}
                options={options}
                maxWidth={400}
            />
        </div>
    </div>;
};
export default OptionSelector;