import {ToastContainer, Zoom} from "react-toastify";
import React from "react";
import {loadCSSFromString} from "@airtable/blocks/ui";


loadCSSFromString(`
:root {
  --toastify-toast-min-height: 55px; 
  --toastify-toast-background: #fff;
  --toastify-color-dark: #002;
}

.Toastify {
    width: 100%;
    display: flex;
    justify-content: center;
}

.Toastify__toast-container {
    all: revert;
    margin-top: 1rem;
}

    .Toastify__toast {
        margin-bottom: 1rem;
        border-radius: 8px;
    }

@media only screen and (max-width: 480px) {
    .Toastify__toast-container {
        all: revert;
        margin-top: 1rem;
    }
    
    .Toastify__toast {
        margin-bottom: 1rem;
        border-radius: 8px;
    }
}
`)

export const Toast = (toastContainerId?: { containerId?: string }) => {
    const multiContainerProps = {
        enableMultiContainer: true,
        ...toastContainerId
    }
    return <ToastContainer
        theme="dark"
        {...(toastContainerId ? multiContainerProps : {})}
        transition={Zoom}
        style={{
            position: "relative",
            maxWidth: '450px',
            width: '70vw',
        }}
        autoClose={4000}
        position="top-center"
        closeButton={true}
    />;
};