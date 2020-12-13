import {React} from './adaptation';
import B from './B';
const {useState, useCallback, useEffect, Component} = React;

class A extends Component {
    render() {
        return <div>
            A 页面
        </div>
    }
}

export default function TestPage(props) {
    const [state, setstate] = useState(true);

    const unmountB = () => {
        setstate(!state);
    }
    return (
        <div className="App">
            HELLO WORLD

            <A/>
            {
                state ? <B /> : null
            }

                <button onClick={unmountB}>unmount B</button>
            </div>
    );
}