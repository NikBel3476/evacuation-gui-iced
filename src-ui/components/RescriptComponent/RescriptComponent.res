@genType.as("RescriptComponent")
@react.component
let make = () => {
    <div>
        <p dataTestId="text-content">{React.string(`Rescript component`)}</p>
    </div>
}