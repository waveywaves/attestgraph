import {NextRequest,NextResponse} from 'next/server'; 
import {execFile} from 'node:child_process';

const COSIGN='cosign';
const run=(args:string[])=>new Promise<string>((res,rej)=>execFile(COSIGN,args,{maxBuffer:10*1024*1024},(e,stdout,stderr)=>e?rej(new Error(stderr||e.message)):res(stdout)));

export async function POST(req:NextRequest){ 
  try{
    const {image, platform = 'linux/amd64'} = await req.json();
    
    if (!image) {
      return NextResponse.json({error: 'Image parameter required'}, {status: 400});
    }
    
    const result = await run([
      'verify-attestation',
      '--type', 'https://spdx.dev/Document',
      '--certificate-oidc-issuer', 'https://token.actions.githubusercontent.com',
      '--certificate-identity', 'https://github.com/chainguard-images/images/.github/workflows/release.yaml@refs/heads/main',
      image
    ]);
    
    return NextResponse.json({
      success: true,
      message: 'Attestation verified successfully',
      output: result
    });
  }catch(e:any){ 
    return NextResponse.json({
      success: false,
      error: e.message
    }, {status: 500}); 
  }
}
