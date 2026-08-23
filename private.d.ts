declare var click: () => void
type Instance = {
	rebuild: (theme?: string) => string
	reset: string
	via_class_change: (...names: string[]) => string
	via_insertion: (...names: string[]) => string
	via_insertion_html: (html: string) => string
}
type ElementStub = {
	contains: () => boolean
	getAttribute: (name: string) => string | null
	nodeType: 1
	querySelectorAll: (selector: string) => ElementStub[]
}
type MutationRecordStub = { target: ElementStub }