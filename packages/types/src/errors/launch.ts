/**
 * The launch request came from a file that was not a notebook.
 *
 * Note: in the future, nteract plans to add support for execution
 * from any file type. Until then, our logic assumes that the file
 * requesting to launch is a notebook file.
 */
export const LAUNCH_NOT_A_NOTEBOOK = "LAUNCH_NOT_A_NOTEBOOK";
/**
 * No ContentRef was provided in the Launch action. ContentRefs
 * are needed to determine which content to associated the launched
 * kernel with.
 */
export const LAUNCH_NO_CONTENT_REF = "LAUNCH_NO_CONTENT_REF";
