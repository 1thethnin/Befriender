export const Screens = {
    Home: {
        setState: (obj) => {
            HomeScreenStates = obj;
        },
    },
};

var HomeScreenStates = {};

export const getDefaultState = () => HomeScreenStates;
