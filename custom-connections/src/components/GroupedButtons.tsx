import React from "react";
import { Button, ButtonGroup } from "@mui/material";

import "@styles/GroupedButtons.scss";

interface GroupedButtonsProps {
    counter: number;
    setCounter: React.Dispatch<React.SetStateAction<number>>;
    min: number;
    max: number;
    label: string;
}

const GroupedButtons = ({
    counter,
    setCounter,
    min,
    max,
    label,
}: GroupedButtonsProps) => {

    const handleIncrement = () => {
        if (counter < max) {
            setCounter(counter + 1);
        }
    };

    const handleDecrement = () => {
        if (counter > min) {
            setCounter(counter - 1);
        }
    };

    return (
        <div className="grouped-buttons">
            <label className="button-label">{label}</label>
            <ButtonGroup size="small" aria-label={`${label} button group`}>
                <Button onClick={handleIncrement} disabled={counter >= max}>
                    +
                </Button>
                <Button disabled>{counter}</Button>
                <Button onClick={handleDecrement} disabled={counter <= min}>
                    -
                </Button>
            </ButtonGroup>
        </div>
    );
};

export default GroupedButtons;
