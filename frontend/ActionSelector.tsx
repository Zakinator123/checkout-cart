import React, {useState} from "react";
import { SelectButtons } from "@airtable/blocks/ui";
const options = [
    { value: "checkout", label: "Check Out" },
    { value: "checkin", label: "Check In" },
];
const SelectButtonsExample = () => {
    const [value, setValue] = useState(options[0].value);

    return (
        <SelectButtons
            value={value}
            onChange={(newValue: string) => setValue(newValue)}
            options={options}
            width="320px"
            margin="2rem"
        />
    );
};
export default SelectButtonsExample;