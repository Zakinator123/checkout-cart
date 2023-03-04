import {SelectOption, SelectOptionValue} from "@airtable/blocks/dist/types/src/ui/select_and_select_buttons_helpers";
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


const OptionSelector = ({
                            currentOption,
                            options,
                            setOption
                        }: { currentOption: SelectOptionValue; setOption: any; options: SelectOption[]; }) =>
    <div className='option-selector'>
        <div>
            <Label>Select the transaction type:</Label>
            <SelectButtons
                value={currentOption}
                onChange={(newValue) => setOption(newValue)}
                options={options}
                maxWidth={400}
            />
        </div>
    </div>;
export default OptionSelector;