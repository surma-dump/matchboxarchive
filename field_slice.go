// Generated by: gen
// TypeWriter: slice
// Directive: +gen on Field

package main

// FieldSlice is a slice of type Field. Use it where you would use []Field.
type FieldSlice []Field

// Where returns a new FieldSlice whose elements return true for func. See: http://clipperhouse.github.io/gen/#Where
func (rcv FieldSlice) Where(fn func(Field) bool) (result FieldSlice) {
	for _, v := range rcv {
		if fn(v) {
			result = append(result, v)
		}
	}
	return result
}
