<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class UploadController extends Controller
{
    public function uploadImage(Request $request)
    {
        $request->validate([
            'file' => 'required|file|image|max:4096'
        ]);

        $file = $request->file('file');

        $cloudName = env('CLOUDINARY_CLOUD_NAME');
        $apiKey    = env('CLOUDINARY_API_KEY');
        $apiSecret = env('CLOUDINARY_API_SECRET');

        // Generate the signature for Cloudinary's signed upload
        $timestamp = time();
        $params = [
            'timestamp' => $timestamp,
            'folder'    => 'fuelease',
        ];

        // Build the string to sign (sorted alphabetically)
        $signatureString = 'folder=fuelease&timestamp=' . $timestamp . $apiSecret;
        $signature = sha1($signatureString);

        // Upload to Cloudinary REST API
        $response = Http::withoutVerifying()
            ->attach('file', file_get_contents($file->getRealPath()), $file->getClientOriginalName())
            ->post("https://api.cloudinary.com/v1_1/{$cloudName}/image/upload", [
                'api_key'   => $apiKey,
                'timestamp' => $timestamp,
                'signature' => $signature,
                'folder'    => 'fuelease',
            ]);

        if ($response->successful()) {
            $data = $response->json();
            return response()->json(['url' => $data['secure_url']]);
        }

        return response()->json([
            'message' => 'Upload failed',
            'error'   => $response->body()
        ], 500);
    }
}
