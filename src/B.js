import {React} from './adaptation';
const {useState, useCallback, useEffect} = React;

export default function B(props) {
    const [count, setCount] = useState(0);

    const onClick = useCallback(
        () => {
            setCount(count => count + 1)
        },
        []
    );

    useEffect(() => {
        console.log('did mount');
        return () => {
            console.log('unmount');
        };
    }, [count]);
    return (
        <>
            <div>
                <span>{count}</span>
                <button onClick={onClick}>
                    click me
                </button>
            </div>
        </>
    );
}