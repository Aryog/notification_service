import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";

type TokenEntry = {
    id: string;
    name: string;
    token: string;
    createdAt: Date;
};

export function TokenList({
    currentToken,
    onSelectTokens
}: {
    currentToken: string | null;
    onSelectTokens?: (tokens: string[]) => void;
}) {
    const [tokens, setTokens] = useState<TokenEntry[]>([]);
    const [selectedTokens, setSelectedTokens] = useState<Set<string>>(new Set());
    const [newDevice, setNewDevice] = useState({
        name: "",
        token: "",
    });

    useEffect(() => {
        // Load tokens from localStorage
        const savedTokens = localStorage.getItem("fcmTokens");
        if (savedTokens) {
            setTokens(JSON.parse(savedTokens));
        }
    }, []);

    const saveToken = () => {
        if (!newDevice.token || !newDevice.name) return;

        const newToken: TokenEntry = {
            id: Math.random().toString(36).substr(2, 9),
            name: newDevice.name,
            token: newDevice.token,
            createdAt: new Date(),
        };

        const updatedTokens = [...tokens, newToken];
        setTokens(updatedTokens);
        localStorage.setItem("fcmTokens", JSON.stringify(updatedTokens));

        // Clear the form
        setNewDevice({
            name: "",
            token: "",
        });
    };

    const saveCurrentDevice = () => {
        if (!currentToken) return;
        setNewDevice(prev => ({
            ...prev,
            token: currentToken
        }));
    };

    const removeToken = (id: string) => {
        const updatedTokens = tokens.filter(token => token.id !== id);
        setTokens(updatedTokens);
        localStorage.setItem("fcmTokens", JSON.stringify(updatedTokens));
    };

    const handleTokenSelection = (token: string) => {
        const updatedSelection = new Set(selectedTokens);
        if (updatedSelection.has(token)) {
            updatedSelection.delete(token);
        } else {
            updatedSelection.add(token);
        }
        setSelectedTokens(updatedSelection);
        onSelectTokens?.(Array.from(updatedSelection));
    };

    const handleSelectAll = () => {
        if (selectedTokens.size === tokens.length) {
            setSelectedTokens(new Set());
            onSelectTokens?.([]);
        } else {
            const allTokens = tokens.map(t => t.token);
            setSelectedTokens(new Set(allTokens));
            onSelectTokens?.(allTokens);
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div className="p-4 rounded-md bg-secondary/50">
                    <h3 className="text-sm font-medium mb-3">Add New Device</h3>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs text-muted-foreground mb-1">
                                Device Name
                            </label>
                            <Input
                                value={newDevice.name}
                                onChange={(e) => setNewDevice(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Enter device name"
                                className="bg-background"
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-muted-foreground mb-1">
                                FCM Token
                            </label>
                            <div className="flex gap-2">
                                <Input
                                    value={newDevice.token}
                                    onChange={(e) => setNewDevice(prev => ({ ...prev, token: e.target.value }))}
                                    placeholder="Enter FCM token"
                                    className="bg-background"
                                />
                                {currentToken && (
                                    <Button
                                        variant="secondary"
                                        onClick={saveCurrentDevice}
                                        className="whitespace-nowrap"
                                    >
                                        Use Current
                                    </Button>
                                )}
                            </div>
                        </div>

                        <Button
                            onClick={saveToken}
                            disabled={!newDevice.token || !newDevice.name}
                            className="w-full text-white rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Add Device
                        </Button>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">Saved Devices</h3>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSelectAll}
                            className="text-xs text-white bg-gray-700 hover:bg-gray-800 rounded-lg border-gray-600"
                        >
                            {selectedTokens.size === tokens.length ? 'Deselect All' : 'Select All'}
                        </Button>
                    </div>

                    <div className="rounded-md border border-border overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">Select</TableHead>
                                    <TableHead>Device Name</TableHead>
                                    <TableHead>Token (truncated)</TableHead>
                                    <TableHead>Added</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tokens.map((token) => (
                                    <TableRow key={token.id}>
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedTokens.has(token.token)}
                                                onCheckedChange={() => handleTokenSelection(token.token)}
                                            />
                                        </TableCell>
                                        <TableCell>{token.name}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-sm">{`${token.token.substring(0, 20)}...`}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(token.token);
                                                    }}
                                                    className="text-white hover:bg-gray-700 rounded-lg"
                                                >
                                                    Copy
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(token.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => removeToken(token.id)}
                                                className="text-white bg-red-600 hover:bg-red-700 rounded-lg"
                                            >
                                                Remove
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </div>
    );
} 