package graph

import (
	"errors"
	"slices"
	"sort"
	"testing"
)

func TestDirectedAndUndirectedEdges(t *testing.T) {
	undirected := New[string](false)
	if !undirected.AddVertex("a") || !undirected.AddVertex("b") || undirected.AddVertex("a") {
		t.Fatal("AddVertex duplicate semantics are incorrect")
	}
	if !undirected.AddEdge("a", "b") || undirected.AddEdge("a", "missing") {
		t.Fatal("AddEdge result is incorrect")
	}
	if got := sortedNeighbors(t, undirected, "b"); !slices.Equal(got, []string{"a"}) {
		t.Fatalf("undirected neighbors of b = %v", got)
	}
	neighbors, _ := undirected.Neighbors("a")
	neighbors[0] = "corrupt"
	if got := sortedNeighbors(t, undirected, "a"); !slices.Equal(got, []string{"b"}) {
		t.Fatalf("caller mutated internal adjacency through Neighbors: %v", got)
	}
	if !undirected.RemoveEdge("a", "b") || undirected.RemoveEdge("a", "b") {
		t.Fatal("RemoveEdge result is incorrect")
	}

	directed := New[string](true)
	directed.AddVertex("a")
	directed.AddVertex("b")
	directed.AddEdge("a", "b")
	if got := sortedNeighbors(t, directed, "b"); len(got) != 0 {
		t.Fatalf("directed reverse edge exists: %v", got)
	}
}

func TestTraversalsVisitReachableVerticesOnce(t *testing.T) {
	g := New[string](false)
	for _, vertex := range []string{"a", "b", "c", "d", "isolated"} {
		g.AddVertex(vertex)
	}
	for _, edge := range [][2]string{{"a", "b"}, {"a", "c"}, {"b", "d"}, {"c", "d"}} {
		g.AddEdge(edge[0], edge[1])
	}
	for name, traversal := range map[string]func(string) ([]string, bool){"bfs": g.BFS, "dfs": g.DFS} {
		t.Run(name, func(t *testing.T) {
			got, ok := traversal("a")
			if !ok {
				t.Fatal("traversal rejected existing start")
			}
			sort.Strings(got)
			if !slices.Equal(got, []string{"a", "b", "c", "d"}) {
				t.Fatalf("visited %v", got)
			}
		})
	}
	if !g.PathExists("a", "d") || g.PathExists("a", "isolated") {
		t.Fatal("PathExists returned incorrect reachability")
	}
	if _, ok := g.BFS("missing"); ok {
		t.Fatal("traversal accepted missing start")
	}
}

func TestShortestPathReturnsDistanceAndRoute(t *testing.T) {
	g := New[string](true)
	for _, vertex := range []string{"a", "b", "c", "d", "x"} {
		g.AddVertex(vertex)
	}
	for _, edge := range []struct {
		from, to string
		weight   int
	}{{"a", "b", 4}, {"a", "c", 1}, {"c", "b", 2}, {"b", "d", 1}, {"c", "d", 5}} {
		if !g.AddWeightedEdge(edge.from, edge.to, edge.weight) {
			t.Fatalf("failed to add edge %+v", edge)
		}
	}
	distance, path, ok := g.ShortestPath("a", "d")
	if !ok || distance != 4 || !slices.Equal(path, []string{"a", "c", "b", "d"}) {
		t.Fatalf("ShortestPath(a,d) = (%d, %v, %v)", distance, path, ok)
	}
	if _, _, ok := g.ShortestPath("a", "x"); ok {
		t.Fatal("unreachable destination returned a path")
	}
	if distance, path, ok := g.ShortestPath("a", "a"); !ok || distance != 0 || !slices.Equal(path, []string{"a"}) {
		t.Fatalf("self path = (%d, %v, %v)", distance, path, ok)
	}
	if g.AddWeightedEdge("a", "d", -1) {
		t.Fatal("negative edge weight was accepted")
	}
}

func TestTopologicalSortRespectsDependenciesAndRejectsCycle(t *testing.T) {
	g := New[string](true)
	for _, vertex := range []string{"parse", "compile", "test", "package"} {
		g.AddVertex(vertex)
	}
	for _, edge := range [][2]string{{"parse", "compile"}, {"compile", "test"}, {"compile", "package"}} {
		g.AddEdge(edge[0], edge[1])
	}
	order, err := g.TopologicalSort()
	if err != nil {
		t.Fatal(err)
	}
	if len(order) != 4 {
		t.Fatalf("topological order has %d vertices, want 4: %v", len(order), order)
	}
	positions := make(map[string]int, len(order))
	for index, vertex := range order {
		positions[vertex] = index
	}
	for _, edge := range [][2]string{{"parse", "compile"}, {"compile", "test"}, {"compile", "package"}} {
		before, beforeOK := positions[edge[0]]
		after, afterOK := positions[edge[1]]
		if !beforeOK || !afterOK || before >= after {
			t.Fatalf("dependency %q appears after %q in %v", edge[0], edge[1], order)
		}
	}
	g.AddEdge("test", "parse")
	if _, err := g.TopologicalSort(); !errors.Is(err, ErrCycle) {
		t.Fatalf("cycle error = %v, want ErrCycle", err)
	}
}

func sortedNeighbors(t *testing.T, g *Graph[string], vertex string) []string {
	t.Helper()
	neighbors, ok := g.Neighbors(vertex)
	if !ok {
		t.Fatalf("Neighbors(%q) rejected existing vertex", vertex)
	}
	sort.Strings(neighbors)
	return neighbors
}
