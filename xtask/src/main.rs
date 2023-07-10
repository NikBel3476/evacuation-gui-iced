mod ops;
mod tasks;

fn main() -> Result<(), anyhow::Error> {
	tasks::main()
}
