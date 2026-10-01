package trie

import (
	"slices"
	"testing"
)

func TestWordAndPrefixQueriesRemainDistinct(t *testing.T) {
	trie := New()
	for _, word := range []string{"help", "hello", "helium", "world"} {
		trie.Insert(word)
	}
	if trie.Contains("hel") || !trie.StartsWith("hel") || !trie.Contains("hello") {
		t.Fatal("Contains and StartsWith semantics are incorrect")
	}
	if trie.Contains("missing") || trie.StartsWith("xyz") {
		t.Fatal("missing word or prefix returned true")
	}
	want := []string{"helium", "hello", "help"}
	if got := trie.WordsWithPrefix("hel"); !slices.Equal(got, want) {
		t.Fatalf("WordsWithPrefix() = %v, want %v", got, want)
	}
}

func TestDeletePreservesSharedPrefix(t *testing.T) {
	trie := New()
	for _, word := range []string{"car", "card", "care"} {
		trie.Insert(word)
	}
	if !trie.Delete("card") || trie.Contains("card") {
		t.Fatal("Delete(card) failed")
	}
	if !trie.Contains("car") || !trie.Contains("care") || !trie.StartsWith("car") {
		t.Fatal("deleting one word damaged or over-pruned shared prefixes")
	}
	if trie.Delete("card") || trie.Delete("missing") {
		t.Fatal("deleting missing word returned true")
	}
}
